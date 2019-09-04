import firebase from './firebase'


export const updateOrders = (batch, storeId, orders, product, productTrans, type) => {
  let remainingQuantity = product.quantity
  for (const order of orders) {
    const orderProduct = order.basket.find(rec => rec.id === product.id)
    const otherProducts = order.basket.filter(rec => rec.id !== product.id)
    let purchasedQuantity
    let orderStatus = 'e'
    let orderProductStores = orderProduct.stores ? orderProduct.stores : []
    if (remainingQuantity > 0){
      if (remainingQuantity >= orderProduct.quantity - orderProduct.purchasedQuantity) {
        purchasedQuantity = orderProduct.quantity - orderProduct.purchasedQuantity
        if (otherProducts.length === otherProducts.filter(rec => rec.quantity === rec.purchasedQuantity).length) {
          orderStatus = 'f'
        }
      } else {
        purchasedQuantity = orderProduct.quantity - orderProduct.purchasedQuantity - remainingQuantity
      }
      if (type === 's') {
        let remQuantity = purchasedQuantity
        for (const trans of productTrans) {
          if (remQuantity > 0){
            orderProductStores.push({
              storeId: trans.storeId,
              quantity: Math.min(trans.quantity, remQuantity),
              price: trans.purchasePrice,
              transId: trans.id
            })
            remQuantity -= Math.min(trans.quantity, remQuantity)
          }
        }
      } else {
        orderProductStores.push({
          storeId,
          quantity: purchasedQuantity,
          price: product.purchasePrice
        })
      }
      const basket = [
        ...otherProducts, 
        {
          ...orderProduct, 
          purchasedQuantity: orderProduct.purchasedQuantity + purchasedQuantity,
          stores: orderProductStores
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
  for (const product of basket) {
    productStockIn(batch, product, storeId, type, transId)
  }
}

const productStockIn = (batch, product, storeId, type, transId) => {
  const otherStores = product.stores.filter(rec => rec.id !== 's')
  const found = product.stores.find(rec => rec.id === 's')
  const quantityInStock = found ? found.quantity : 0
  const grossPrice = found ? found.quantity * found.price : 0
  const avgPrice = (grossPrice + (product.quantity * product.actualPrice)) / (product.quantity + quantityInStock)
  const grossPurchasePrice = found ? found.quantity * found.purchasePrice : 0
  const avgPurchasePrice = (grossPurchasePrice + (product.quantity * product.purchasePrice)) / (product.quantity + quantityInStock)
  const productRef = firebase.firestore().collection('products').doc(product.id)
  batch.update(productRef, {stores: [...otherStores, {id: 's', price: avgPrice, purchasePrice: avgPurchasePrice, quantity: product.quantity + quantityInStock, time: new Date()}]})
  if (type === 'p'){
    const productTransRef = firebase.firestore().collection('productTrans').doc()
    batch.set(productTransRef, {
      productId: product.id,
      storeId,
      quantity: product.quantity,
      pirce: product.actualPrice,
      purchasePrice: product.purchasePrice,
      time: new Date()
    })  
  } else {
    const productTransRef = firebase.firestore().collection('productTrans').doc(transId)
    batch.update(productTransRef, {
      quantity: firebase.firestore.FieldValue.increment(product.quantity)
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
  let productOrders
  let productTrans
  let remainingQuantity
  let productsIn = []
  for (const product of basket) {
    productOrders = orders.filter(rec => rec.id === product.id && rec.price === product.price)
    productOrders.sort((order1, order2) => order1.time.seconds - order2.time.seconds)
    productTrans = trans.filter(rec => rec.productId === product.id)
    productTrans.sort((trans1, trans2) => trans1.time.seconds - trans2.time.seconds)
    remainingQuantity = updateOrders(batch, 's', productOrders, product, productTrans, 'p')
    if (remainingQuantity > 0) {
      productsIn.push({...product, quantity: remainingQuantity})
    }
  }
  stockIn(batch, storeId, productsIn, 'p')
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
  let productOrders
  let productTrans
  for (const product of basket) {
    productOrders = orders.filter(order => order.basket.find(rec => rec.id === product.id && rec.price === product.price))
    productOrders.sort((order1, order2) => order1.time.seconds - order2.time.seconds)
    productTrans = trans.filter(rec => rec.productId === product.id)
    productTrans.sort((trans1, trans2) => trans1.time.seconds - trans2.time.seconds)
    updateOrders(batch, 's', productOrders, product, productTrans, 's')
    productStockOut(batch, product, productTrans)
  }
  await batch.commit()
}

const productStockOut = (batch, product, productTrans) => {
  const otherStores = product.stores.filter(rec => rec.id !== 's')
  const found = product.stores.find(rec => rec.id === 's')
  const avgPrice = ((found.quantity * found.price) - (product.quantity * product.actualPrice)) / (found.quantity - product.quantity)
  const avgPurchasePrice = ((found.quantity * found.purchasePrice) - (product.quantity * product.purchasePrice)) / (found.quantity - product.quantity)
  const productRef = firebase.firestore().collection('products').doc(product.id)
  if (found.quantity - product.quantity > 0){
    batch.update(productRef, {stores: [...otherStores, {id: 's', price: avgPrice, purchasePrice: avgPurchasePrice, quantity: found.quantity - product.quantity, time: new Date()}]})
  } else {
    batch.update(productRef, {stores: otherStores})
  }
  let remainingQuantity = product.quantity
  let quantity
  let productTransRef
  for (const trans of productTrans) {
    if (remainingQuantity > 0) {
      quantity = Math.min(trans.quantity, remainingQuantity)
      productTransRef = firebase.firestore().collection('productTrans').doc(trans.id)
      batch.update(productTransRef, {quantity: trans.quantity - remainingQuantity})
      remainingQuantity -= quantity
    }
  }
}

export const editOrder = async (order, product, store) => {
  const batch = firebase.firestore().batch()
  const orderProduct = order.basket.find(rec => rec.id === product.id)
  const otherProducts = order.basket.filter(rec => rec.id !== product.id)
  const orderProductStores = orderProduct.stores
  const quantity = orderProductStores.find(rec => rec.storeId === store.storeId).quantity
  const transId = orderProductStores.find(rec => rec.storeId === store.storeId).transId
  const otherStores = orderProductStores.filter(rec => rec.storeId !== store.storeId)
  const basket = [
    ...otherProducts, 
    {
      ...orderProduct, 
      purchasedQuantity: orderProduct.purchasedQuantity - quantity,
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
    stockIn(batch, store.storeId, {...product, quantity}, 'r', store.transId)
  }
  await batch.commit()
}

export const addProduct = async (product, store, purchasePrice, price, offerEnd) => {
  const stores = [
    ...product.stores, 
    {id: store.id, 
      purchasePrice: purchasePrice * 1000, 
      price: price * 1000, 
      oldPurchasePrice: null, 
      oldPrice: null, 
      offerEnd, 
      time: new Date()
    }]
  await firebase.firestore().collection('products').doc(product.id).update({
    stores: stores,
    status: 'a'
  })
}

export const newProduct = async product => {
  const stores = [{
    id: product.storeId, 
    purchasePrice: product.purchasePrice * 1000, 
    price: product.price * 1000, 
    oldPurchasePrice: null, 
    oldPrice: null,
    offerEnd: product.offerEnd,
    time: new Date()
  }]
  const docRef = await firebase.firestore().collection('products').add({
    name: product.name,
    description: product.description,
    category: product.category,
    trademark: product.trademark,
    country: product.country,
    stores,
    sales: 0,
    rating: null,
    byWeight: product.byWeight,
    isNew: product.isNew,
    isOffer: product.isOffer,
    time: new Date(),
    status: 'a'
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
    description: product.description,
    category: product.category,
    trademark: product.trademark,
    byWeight: product.byWeight,
    isNew: product.isNew,
    isOffer: product.isOffer,
    country: product.country,
    imageUrl: url,
  })
}

export const editPrice = async (store, product, purchasePrice, price, oldPurchasePrice, oldPrice, offerEnd) => {
  let stores = product.stores.filter(rec => rec.id !== store.id)
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
  await firebase.firestore().collection('products').doc(product.id).update({
    stores
  })
}


export const deleteProduct = async (store, product) => {
  const stores = product.stores.filter(rec => rec.id !== store.id)
  if (stores.length > 0) {
    await firebase.firestore().collection('products').doc(product.id).update({
      stores
    })
  } else {
    await firebase.firestore().collection('products').doc(product.id).update({
      stores: [],
      status: 'd'
    })
  }
}

export const confirmPrice = async (store, product) => {
  let stores = product.stores.filter(rec => rec.id !== store.id)
  const newStore = product.stores.find(rec => rec.id === store.id)
  stores = [...stores, {...newStore, time: new Date()}]
  await firebase.firestore().collection('products').doc(product.id).update({
    stores
  })
}

export const addStore = async store => {
  const docRef = await firebase.firestore().collection('stores').add(store)
  return docRef.id
}

export const addStock = async name => {
  await firebase.firestore().collection("stores").doc("s").set({
    name
})
}

export const addCountry = async country => {
  const docRef = await firebase.firestore().collection('countries').add(country)
  return docRef.id
}

export const addSection = async section => {
  const docRef = await firebase.firestore().collection('sections').add(section)
  return docRef.id
}

export const addCategory = async category => {
  const docRef = await firebase.firestore().collection('categories').add(category)
  return docRef.id
}

export const addTrademark = async trademark => {
  const docRef = await firebase.firestore().collection('trademarks').add(trademark)
  return docRef.id
}
