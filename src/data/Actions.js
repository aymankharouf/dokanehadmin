import firebase from './firebase'

export const showMessage = (props, type, messageText) => {
  const message = props.f7router.app.toast.create({
    text: `<span class=${type}>${messageText}<span>`,
    position: 'top',
    closeTimeout: 3000,
  });
  message.open();
}

export const login = async (email, password) => {
  await firebase.auth().signInWithEmailAndPassword(email, password)
}

export const logout = async () => {
  await firebase.auth().signOut()
}

export const updateOrders = (batch, storeId, orders, pack, packTrans, type) => {
  let remainingQuantity = pack.quantity
  for (const order of orders) {
    const orderPack = order.basket.find(rec => rec.id === pack.id)
    const otherPacks = order.basket.filter(rec => rec.id !== pack.id)
    let purchasedQuantity
    let orderStatus = 'e'
    let orderPackStores = orderPack.stores || []
    if (remainingQuantity > 0){
      if (remainingQuantity >= orderPack.quantity - orderPack.purchasedQuantity) {
        purchasedQuantity = orderPack.quantity - orderPack.purchasedQuantity
        if (otherPacks.length === otherPacks.filter(rec => rec.quantity === rec.purchasedQuantity).length) {
          orderStatus = 'f'
        }
      } else {
        purchasedQuantity = orderPack.quantity - orderPack.purchasedQuantity - remainingQuantity
      }
      if (type === 's') {
        let remQuantity = purchasedQuantity
        for (const trans of packTrans) {
          if (remQuantity > 0){
            orderPackStores.push({
              storeId: trans.storeId,
              quantity: Math.min(trans.quantity, remQuantity),
              price: trans.purchasePrice,
              transId: trans.id
            })
            remQuantity -= Math.min(trans.quantity, remQuantity)
          }
        }
      } else {
        orderPackStores.push({
          storeId,
          quantity: purchasedQuantity,
          price: pack.purchasePrice
        })
      }
      const basket = [
        ...otherPacks, 
        {
          ...orderPack, 
          purchasedQuantity: orderPack.purchasedQuantity + purchasedQuantity,
          stores: orderPackStores
        }
      ]
      const orderRef = firebase.firestore().collection('orders').doc(order.id)
      batch.update(orderRef, {
        basket,
        status: orderStatus,
        statusTime: new Date()
      })
      remainingQuantity -=  purchasedQuantity
    }
  }
  return remainingQuantity
}

export const updateOrder = async order => {
  await firebase.firestore().collection('orders').doc(order.id).update({
    basket: order.basket,
    status: order.status,
    statusTime: new Date()
  })
}

const stockIn = (batch, storeId, basket, type, transId) => {
  const transRef = firebase.firestore().collection('stockTrans').doc()
  batch.set(transRef, {
    basket,
    type,
    time: new Date()
  })
  for (const pack of basket) {
    packStockIn(batch, pack, storeId, type, transId)
  }
}

const packStockIn = (batch, pack, storeId, type, transId) => {
  const otherStores = pack.stores.filter(rec => rec.id !== 's')
  const found = pack.stores.find(rec => rec.id === 's')
  const quantityInStock = found ? found.quantity : 0
  const grossPrice = found ? found.quantity * found.price : 0
  const avgPrice = (grossPrice + (pack.quantity * pack.actualPrice)) / (pack.quantity + quantityInStock)
  const grossPurchasePrice = found ? found.quantity * found.purchasePrice : 0
  const avgPurchasePrice = (grossPurchasePrice + (pack.quantity * pack.purchasePrice)) / (pack.quantity + quantityInStock)
  const packRef = firebase.firestore().collection('packs').doc(pack.id)
  batch.update(packRef, {stores: [...otherStores, {id: 's', price: avgPrice, purchasePrice: avgPurchasePrice, quantity: pack.quantity + quantityInStock, time: new Date()}]})
  if (type === 'p'){
    const packTransRef = firebase.firestore().collection('packTrans').doc()
    batch.set(packTransRef, {
      packId: pack.id,
      storeId,
      quantity: pack.quantity,
      pirce: pack.actualPrice,
      purchasePrice: pack.purchasePrice,
      time: new Date()
    })  
  } else {
    const packTransRef = firebase.firestore().collection('packTrans').doc(transId)
    batch.update(packTransRef, {
      quantity: firebase.firestore.FieldValue.increment(pack.quantity)
    })
  }
}

export const confirmPurchase = async (orders, storeId, basket, trans, total) => {
  const batch = firebase.firestore().batch()
  const purchaseRef = firebase.firestore().collection('purchases').doc()
  batch.set(purchaseRef, {
    storeId,
    basket,
    total,
    time: new Date()
  })
  let packOrders
  let packTrans
  let remainingQuantity
  let packsIn = []
  for (const pack of basket) {
    packOrders = orders.filter(rec => rec.basket.find(basketPack => basketPack.id === pack.id && basketPack.price === pack.price))
    packOrders.sort((order1, order2) => order1.time.seconds - order2.time.seconds)
    packTrans = trans.filter(rec => rec.packId === pack.id)
    packTrans.sort((trans1, trans2) => trans1.time.seconds - trans2.time.seconds)
    remainingQuantity = updateOrders(batch, 's', packOrders, pack, packTrans, 'p')
    if (remainingQuantity > 0) {
      packsIn.push({...pack, quantity: remainingQuantity})
    }
  }
  stockIn(batch, storeId, packsIn, 'p')
  await batch.commit()
}

export const stockOut = async (orders, basket, trans) => {
  const batch = firebase.firestore().batch()
  const transRef = firebase.firestore().collection('stockTrans').doc()
  batch.set(transRef, {
    basket,
    type: 's',
    time: new Date()
  })
  let packOrders
  let packTrans
  for (const pack of basket) {
    packOrders = orders.filter(order => order.basket.find(rec => rec.id === pack.id && rec.price === pack.price))
    packOrders.sort((order1, order2) => order1.time.seconds - order2.time.seconds)
    packTrans = trans.filter(rec => rec.packId === pack.id)
    packTrans.sort((trans1, trans2) => trans1.time.seconds - trans2.time.seconds)
    updateOrders(batch, 's', packOrders, pack, packTrans, 's')
    packStockOut(batch, pack, packTrans)
  }
  await batch.commit()
}

const packStockOut = (batch, pack, packTrans) => {
  const otherStores = pack.stores.filter(rec => rec.id !== 's')
  const found = pack.stores.find(rec => rec.id === 's')
  const avgPrice = ((found.quantity * found.price) - (pack.quantity * pack.actualPrice)) / (found.quantity - pack.quantity)
  const avgPurchasePrice = ((found.quantity * found.purchasePrice) - (pack.quantity * pack.purchasePrice)) / (found.quantity - pack.quantity)
  const packRef = firebase.firestore().collection('packs').doc(pack.id)
  if (found.quantity - pack.quantity > 0){
    batch.update(packRef, {stores: [...otherStores, {id: 's', price: avgPrice, purchasePrice: avgPurchasePrice, quantity: found.quantity - pack.quantity, time: new Date()}]})
  } else {
    batch.update(packRef, {stores: otherStores})
  }
  let remainingQuantity = pack.quantity
  let quantity
  let packTransRef
  for (const trans of packTrans) {
    if (remainingQuantity > 0) {
      quantity = Math.min(trans.quantity, remainingQuantity)
      packTransRef = firebase.firestore().collection('packTrans').doc(trans.id)
      batch.update(packTransRef, {quantity: trans.quantity - remainingQuantity})
      remainingQuantity -= quantity
    }
  }
}

export const editOrder = async (order, pack, store) => {
  const batch = firebase.firestore().batch()
  const orderPack = order.basket.find(rec => rec.id === pack.id)
  const otherPacks = order.basket.filter(rec => rec.id !== pack.id)
  const orderPackStores = orderPack.stores
  const quantity = orderPackStores.find(rec => rec.storeId === store.storeId).quantity
  const transId = orderPackStores.find(rec => rec.storeId === store.storeId).transId
  const otherStores = orderPackStores.filter(rec => rec.storeId !== store.storeId)
  const basket = [
    ...otherPacks, 
    {
      ...orderPack, 
      purchasedQuantity: orderPack.purchasedQuantity - quantity,
      stores: otherStores
    }
  ]
  const orderRef = firebase.firestore().collection('orders').doc(order.id)
  batch.update(orderRef, {
    basket,
    status: 'e',
    statusTime: new Date()
  })
  if (transId) {
    stockIn(batch, store.storeId, {...pack, quantity}, 'r', store.transId)
  }
  await batch.commit()
}

export const addStorePack = async (pack, store, purchasePrice, price, offerEnd) => {
  const stores = [
    ...pack.stores, 
    {id: store.id, 
      purchasePrice: purchasePrice * 1000, 
      price: price * 1000, 
      oldPurchasePrice: null, 
      oldPrice: null, 
      offerEnd, 
      time: new Date()
    }]
  await firebase.firestore().collection('packs').doc(pack.id).update({
    stores: stores,
    status: 'a'
  })
}

export const addProduct = async product => {
  const docRef = await firebase.firestore().collection('products').add({
    name: product.name,
    category: product.category,
    trademark: product.trademark,
    country: product.country,
    byWeight: product.byWeight,
    isNew: product.isNew,
    isActive: false,
    sales: 0,
    rating: null,
    time: new Date()
  })
  const filename = product.image.name
  const ext = filename.slice(filename.lastIndexOf('.'))
  const fileData = await firebase.storage().ref().child('products/' + docRef.id + ext).put(product.image)
  const url = await firebase.storage().ref().child(fileData.metadata.fullPath).getDownloadURL()
  await firebase.firestore().collection('products').doc(docRef.id).update({imageUrl: url})
}

export const editProduct = async product => {
  let url
  if (product.image) {
    const filename = product.image.name
    const ext = filename.slice(filename.lastIndexOf('.'))
    const fileData = await firebase.storage().ref().child('products/' + product.id + ext).put(product.image)
    url = await firebase.storage().ref().child(fileData.metadata.fullPath).getDownloadURL()
  } else {
    url = product.imageUrl
  }
  await firebase.firestore().collection('products').doc(product.id).update({
    name: product.name,
    category: product.category,
    trademark: product.trademark,
    byWeight: product.byWeight,
    isNew: product.isNew,
    isActive: product.isActive,
    country: product.country,
    imageUrl: url,
  })
}

export const editPrice = async (store, pack, purchasePrice, price, oldPurchasePrice, oldPrice, offerEnd) => {
  let stores = pack.stores.filter(rec => rec.id !== store.id)
  stores = [
    ...stores, 
    {id: store.id, 
      purchasePrice: purchasePrice * 1000,
      price: price * 1000,
      oldPurchasePrice, 
      oldPrice, 
      offerEnd, 
      time: new Date()
    }]
  await firebase.firestore().collection('packs').doc(pack.id).update({
    stores
  })
}

export const deleteStorePack = async (store, pack) => {
  const stores = pack.stores.filter(rec => rec.id !== store.id)
  await firebase.firestore().collection('packs').doc(pack.id).update({
    stores
  })
}

export const confirmPrice = async (store, pack) => {
  let stores = pack.stores.filter(rec => rec.id !== store.id)
  const newStore = pack.stores.find(rec => rec.id === store.id)
  stores = [...stores, {...newStore, time: new Date()}]
  await firebase.firestore().collection('packs').doc(pack.id).update({
    stores
  })
}

export const addStore = async store => {
  await firebase.firestore().collection('stores').add(store)
}

export const addStock = async name => {
  await firebase.firestore().collection("stores").doc("s").set({
    name
})
}

export const addCountry = async country => {
  await firebase.firestore().collection('countries').add(country)
}

export const editCountry = async country => {
  await firebase.firestore().collection('countries').doc(country.id).update({
    name: country.name,
    isActive: country.isActive
  })
}

export const addSection = async section => {
  await firebase.firestore().collection('sections').add(section)
}

export const editSection = async section => {
  await firebase.firestore().collection('sections').doc(section.id).update({
    name: section.name,
    isActive: section.isActive
  })
}

export const addCategory = async category => {
  await firebase.firestore().collection('categories').add(category)
}

export const editCategory = async category => {
  await firebase.firestore().collection('categories').doc(category.id).update({
    name: category.name,
    isActive: category.isActive
  })
}

export const addTrademark = async trademark => {
  await firebase.firestore().collection('trademarks').add(trademark)
}

export const editTrademark = async trademark => {
  await firebase.firestore().collection('trademarks').doc(trademark.id).update({
    name: trademark.name,
    isActive: trademark.isActive
  })
}

export const resolveForgetPassword = async trans => {
  await firebase.firestore().collection('forgetPassword').doc(trans.id).update({
    resolved: true
  })
}

export const addPack = async pack => {
  await firebase.firestore().collection('packs').add({
    ...pack,
    stores: [],
    time: new Date(),
    status: 'a'
  })
}

export const editPack = async pack => {
  await firebase.firestore().collection('packs').doc(pack.id).update(pack)
}

export const deletePack = async pack => {
  await firebase.firestore().collection('packs').doc(pack.id).update({
    status: 'd'
  })
}
