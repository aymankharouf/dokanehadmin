import firebase from './firebase'

export const showMessage = (props, type, messageText) => {
  const message = props.f7router.app.toast.create({
    text: `<span class=${type}>${messageText}<span>`,
    closeTimeout: 3000,
  })
  message.open()
}

export const login = (email, password) => {
  return firebase.auth().signInWithEmailAndPassword(email, password)
}

export const logout = () => {
  return firebase.auth().signOut()
}

export const updateOrders = (batch, storeId, orders, basketPack) => {
  let remainingQuantity = basketPack.quantity
  for (const o of orders){
    if (remainingQuantity <= 0) break
    const orderPack = o.basket.find(p => p.packId === basketPack.packId)
    const otherPacks = o.basket.filter(p => p.packId !== basketPack.packId)
    let purchasedQuantity
    let orderStatus = 'e'
    if (remainingQuantity >= orderPack.quantity - orderPack.purchasedQuantity) {
      purchasedQuantity = orderPack.quantity - orderPack.purchasedQuantity
      if (otherPacks.length === otherPacks.filter(p => p.quantity === p.purchasedQuantity).length) {
        orderStatus = 'f'
      }
    } else {
      purchasedQuantity = remainingQuantity
    }
    const avgPurchasePrice = orderPack.purchasedQuantity === 0 ? basketPack.purchasePrice : parseInt(((orderPack.purchasePrice * orderPack.purchasedQuantity) + (basketPack.purchasePrice * purchasedQuantity)) / (orderPack.purchasedQuantity + purchasedQuantity))
    const avgActualPrice = orderPack.purchasedQuantity === 0 ? basketPack.actualPrice : parseInt(((orderPack.actualPrice * orderPack.purchasedQuantity) + (basketPack.actualPrice * purchasedQuantity)) / (orderPack.purchasedQuantity + purchasedQuantity))
    const basket = [
      ...otherPacks, 
      {
        ...orderPack, 
        purchasedQuantity: orderPack.purchasedQuantity + purchasedQuantity,
        storeId: orderPack.purchasedQuantity === 0 ? storeId : 'm',
        purchasePrice: avgPurchasePrice,
        actualPrice: avgActualPrice
      }
    ]
    const profit = basket.reduce((sum, p) => sum + p.purchasedQuantity ? ((p.actualPrice - p.purchasePrice) * p.purchasedQuantity) : 0, 0)
    const total = basket.reduce((sum, p) => sum + ((p.actualPrice ? p.actualPrice : p.price) * p.quantity), 0)
    const fraction = total - Math.floor(total / 50) * 50
    const orderRef = firebase.firestore().collection('orders').doc(o.id)
    batch.update(orderRef, {
      basket,
      profit: profit - fraction,
      total: total - fraction,
      status: orderStatus,
      statusTime: new Date()
    })
    remainingQuantity -=  purchasedQuantity
  }
  return remainingQuantity
}

export const updateOrderStatus = (order, type, packs, users, invitations, discountTypes) => {
  const batch = firebase.firestore().batch()
  const orderRef = firebase.firestore().collection('orders').doc(order.id)
  batch.update(orderRef, {
    status: type,
    statusTime: new Date()
  })
  if (type === 'i') {
    let basket = order.basket.filter(p => p.purchasedQuantity > 0)
    basket = basket.map(p => {
      return {
        ...p,
        stores: packs.find(pa => pa.id === p.packId).stores
      }
    })
    stockIn(batch, 'i', basket)
  }
  if (type === 'd' && order.status !== 'd'){
    let packRef
    order.basket.forEach(p => {
      packRef = firebase.firestore().collection("packs").doc(p.packId)
      batch.update(packRef, {
        sales: firebase.firestore.FieldValue.increment(p.quantity)
      })
    })
    const netPrice = order.total + order.fixedFees + order.deliveryFees - order.discount.value
    const customerRef = firebase.firestore().collection('customers').doc(order.userId)
    batch.update(customerRef, {
      totalPayments: firebase.firestore.FieldValue.increment(netPrice),
      totalOrders: firebase.firestore.FieldValue.increment(1),
      limit: firebase.firestore.FieldValue.increment(5000)
    })
    switch (order.discount.type){
      case 'f':
        batch.update(customerRef, {
          firstOrderDiscount: 0 
        })
        break
      case 'i':
        batch.update(customerRef, {
          invitationsDiscount: firebase.firestore.FieldValue.increment(-1 * order.discount.value)
        })
        break
      case 'p':
        batch.update(customerRef, {
          priceAlarmsDiscount: firebase.firestore.FieldValue.increment(-1 * order.discount.value)
        })
        break
      default:
    }
    const userInfo = users.find(u => u.id === order.userId)
    const invitedBy = invitations.find(i => i.friendMobile === userInfo.mobile)
    if (invitedBy) {
      const invitedByRef = firebase.firestore().collection('customers').doc(invitedBy.userId)
      batch.update(invitedByRef, {
        invitationsDiscount: firebase.firestore.FieldValue.increment(discountTypes.find(t => t.id === 'i').value)
      })
    }
  }
  return batch.commit()
}

const stockIn = (batch, type, basket, storeId) => {
  const transRef = firebase.firestore().collection('stockTrans').doc()
  const packBasket = basket.map(p => {
    return {
      packId: p.packId,
      price: p.actualPrice,
      quantity: p.quantity,
      purchasePrice: p.purchasePrice
    }
  })
  const total = packBasket.reduce((sum, p) => sum + ((type === 's' ? p.price : p.purchasePrice) * p.quantity), 0)
  batch.set(transRef, {
    basket: packBasket,
    storeId: storeId ? storeId : '',
    type,
    total,
    time: new Date()
  })
  basket.forEach(p => {
    updateStock(batch, p)
  })
}

const updateStock = (batch, basketPack) => {
  const otherStores = basketPack.stores.filter(s => s.storeId !== 's')
  const found = basketPack.stores.find(s => s.storeId === 's')
  const quantityInStock = found ? found.quantity : 0
  const grossPrice = found ? found.quantity * found.price : 0
  const avgPrice = (grossPrice + (basketPack.quantity * basketPack.actualPrice)) / (basketPack.quantity + quantityInStock)
  const grossPurchasePrice = found ? found.quantity * found.purchasePrice : 0
  const avgPurchasePrice = (grossPurchasePrice + (basketPack.quantity * basketPack.purchasePrice)) / (basketPack.quantity + quantityInStock)
  const packRef = firebase.firestore().collection('packs').doc(basketPack.packId)
  batch.update(packRef, {
    stores: [
      ...otherStores, 
      {storeId: 's', 
      price: parseInt(avgPrice), 
      purchasePrice: parseInt(avgPurchasePrice), 
      quantity: basketPack.quantity + quantityInStock, 
      time: new Date()}
    ]
  })
}

export const confirmPurchase = (orders, storeId, basket, total, discount) => {
  const batch = firebase.firestore().batch()
  const purchaseRef = firebase.firestore().collection('purchases').doc()
  const packBasket = basket.map(p => {
    return {
      packId: p.packId,
      price: p.actualPrice,
      quantity: p.quantity,
      purchasePrice: p.purchasePrice
    }
  })
  batch.set(purchaseRef, {
    storeId,
    basket: packBasket,
    total,
    discount: parseInt(discount * 1000),
    time: new Date()
  })
  let packOrders
  let remainingQuantity
  let packsIn = []
  basket.forEach(p => {
    packOrders = orders.filter(o => o.basket.find(op => op.packId === p.packId && op.price === p.price))
    packOrders.sort((o1, o2) => o1.time.seconds - o2.time.seconds)
    remainingQuantity = updateOrders(batch, storeId, packOrders, p)
    if (remainingQuantity > 0) {
      packsIn.push({...p, quantity: remainingQuantity})
    }
  })
  if (packsIn.length > 0) {
    stockIn(batch, 'p', packsIn, storeId)
  }
  return batch.commit()
}

export const stockOut = (orders, basket) => {
  const batch = firebase.firestore().batch()
  const transRef = firebase.firestore().collection('stockTrans').doc()
  const packBasket = basket.map(p => {
    return {
      packId: p.packId,
      price: p.actualPrice,
      quantity: p.quantity,
      purchasePrice: p.purchasePrice
    }
  })
  batch.set(transRef, {
    basket: packBasket,
    type: 's',
    time: new Date()
  })
  let packOrders
  basket.forEach(p => {
    packOrders = orders.filter(o => o.basket.find(op => op.id === p.packId && op.price === p.price))
    packOrders.sort((o1, o2) => o1.time.seconds - o2.time.seconds)
    updateOrders(batch, 's', packOrders, p)
    packStockOut(batch, p)
  })
  return batch.commit()
}

const packStockOut = (batch, basketPack) => {
  const otherStores = basketPack.stores.filter(s => s.storeId !== 's')
  const found = basketPack.stores.find(s => s.storeId === 's')
  let avgPrice
  let avgPurchasePrice
  if (found.quantity - basketPack.quantity > 0){
    avgPrice = ((found.quantity * found.price) - (basketPack.quantity * basketPack.actualPrice)) / (found.quantity - basketPack.quantity)
    avgPurchasePrice = ((found.quantity * found.purchasePrice) - (basketPack.quantity * basketPack.purchasePrice)) / (found.quantity - basketPack.quantity)
  } else {
    avgPrice = null
    avgPurchasePrice = null
  }
  const packRef = firebase.firestore().collection('packs').doc(basketPack.packId)
  batch.update(packRef, {
    stores: [...otherStores, 
      {storeId: 's', 
      price: avgPrice ? parseInt(avgPrice) : avgPrice, 
      purchasePrice: avgPurchasePrice ? parseInt(avgPurchasePrice) : avgPurchasePrice, 
      quantity: found.quantity - basketPack.quantity, 
      time: new Date()}
    ]
  })
}

export const addStorePack = (pack, store, purchasePrice, price, offerEnd) => {
  const stores = [
    ...pack.stores, 
    { storeId: store.id, 
      purchasePrice, 
      price, 
      offerEnd, 
      time: new Date()
    }
  ]
  return firebase.firestore().collection('packs').doc(pack.id).update({
    stores: stores
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
  return firebase.firestore().collection('products').doc(product.id).update({
    name: product.name,
    category: product.category,
    trademark: product.trademark,
    byWeight: product.byWeight,
    isNew: product.isNew,
    country: product.country,
    imageUrl: url,
  })
}

export const editPrice = (store, pack, purchasePrice, price, offerEnd) => {
  let stores = pack.stores.filter(s => s.storeId !== store.id)
  stores = [
    ...stores, 
    { storeId: store.id, 
      purchasePrice,
      price,
      offerEnd, 
      time: new Date()
    }]
  return firebase.firestore().collection('packs').doc(pack.id).update({
    stores
  })
}

export const deleteStorePack = (store, pack) => {
  const stores = pack.stores.filter(s => s.storeId !== store.id)
  return firebase.firestore().collection('packs').doc(pack.id).update({
    stores
  })
}

export const confirmPrice = (store, pack) => {
  let stores = pack.stores.filter(s => s.storeId !== store.id)
  const newStore = pack.stores.find(s => s.storeId === store.id)
  stores = [...stores, {...newStore, time: new Date()}]
  return firebase.firestore().collection('packs').doc(pack.id).update({
    stores
  })
}

export const addStore = store => {
  return firebase.firestore().collection('stores').add(store)
}

export const editStore = store => {
  return firebase.firestore().collection('stores').doc(store.id).update(store)
}

export const addStock = name => {
  return firebase.firestore().collection("stores").doc("s").set({
    name,
    type: '1'
  })
}

export const addSpending = spending => {
  return firebase.firestore().collection("spendings").add({
    ...spending,
    time: new Date()
  })
}

export const editSpending = spending => {
  return firebase.firestore().collection("spendings").doc(spending.id).update(spending)
}

export const addCountry = country => {
  return firebase.firestore().collection('countries').add(country)
}

export const editCountry = country => {
  return firebase.firestore().collection('countries').doc(country.id).update(country)
}

export const addLocation = location => {
  return firebase.firestore().collection('locations').add(location)
}

export const editLocation = location => {
  return firebase.firestore().collection('locations').doc(location.id).update(location)
}

export const addSection = section => {
  return firebase.firestore().collection('sections').add(section)
}

export const editSection = section => {
  return firebase.firestore().collection('sections').doc(section.id).update(section)
}

export const addCategory = category => {
  return firebase.firestore().collection('categories').add(category)
}

export const editCategory = category => {
  return firebase.firestore().collection('categories').doc(category.id).update(category)
}

export const addTrademark = trademark => {
  return firebase.firestore().collection('trademarks').add(trademark)
}

export const editTrademark = trademark => {
  return firebase.firestore().collection('trademarks').doc(trademark.id).update(trademark)
}

export const resolveForgetPassword = transId => {
  return firebase.firestore().collection('forgetPassword').doc(transId).update({
    resolved: true
  })
}

export const addPack = pack => {
  return firebase.firestore().collection('packs').add(pack)
}

export const editPack = pack => {
  return firebase.firestore().collection('packs').doc(pack.id).update(pack)
}

export const editCustomer = (customer, name) => {
  const batch = firebase.firestore().batch()
  const customerRef = firebase.firestore().collection('customers').doc(customer.id)
  batch.update(customerRef, customer)
  const userRef = firebase.firestore().collection('users').doc(customer.id)
  batch.update(userRef, {
    name
  })
  return batch.commit()
}

export const approveUser = user => {
  const batch = firebase.firestore().batch()
  const customerRef = firebase.firestore().collection('customers').doc(user.id)
  batch.set(customerRef, {
    type: user.storeId ? 'o' : 'n',
    storeId: user.storeId,
    address: user.address,
    limit: 10000,
    totalOrders: 0,
    totalPayments: 0,
    debit: 0,
    withDelivery: false,
    locationId: user.locationId,
    invitationsDiscount: 0,
    priceAlarmsDiscount: 0,
    isOldAge: false,
    position: ''
  })
  const userRef = firebase.firestore().collection('users').doc(user.id)
  batch.update(userRef, {
    name: user.name,
    storeName: firebase.firestore.FieldValue.delete(),
    address: firebase.firestore.FieldValue.delete()
  })
  return batch.commit()
}

export const approvePriceAlarm = (priceAlarm, pack, store, customer) => {
  const storeId = customer.type === 'o' ? customer.storeId : store.id
  const batch = firebase.firestore().batch()
  const priceAlarmRef = firebase.firestore().collection('priceAlarms').doc(priceAlarm.id)
  if (customer.type === 'o'){
    batch.update(priceAlarmRef, {
      status: 'a'
    })  
  } else {
    batch.update(priceAlarmRef, {
      status: 'a',
      storeId
    })  
  }
  let stores = pack.stores.filter(s => s.storeId !== storeId)
  if (priceAlarm.price > 0) {
    stores = [
      ...stores, 
      { storeId: storeId,
        purchasePrice: priceAlarm.price,
        price: priceAlarm.price,
        time: new Date(),
        userId: priceAlarm.userId,
        offerEnd: priceAlarm.offerEnd
      }
    ]  
  }
  const packRef = firebase.firestore().collection('packs').doc(pack.id)
  batch.update(packRef, {
    stores
  })
  if (customer.type !== 'o'){
    const customerRef = firebase.firestore().collection('customers').doc(customer.id)
    batch.update(customerRef, {
      lessPriceDiscount: firebase.firestore.FieldValue.increment(500)
    })
  }
  return batch.commit()
}

export const rejectPriceAlarm = priceAlarm => {
  return firebase.firestore().collection('priceAlarms').doc(priceAlarm.id).update({
    status: 'r'
  })
}

export const packUnavailable = (pack, packPrice, orders) => {
  const batch = firebase.firestore().batch()
  const packOrders = orders.filter(o => o.basket.find(p => p.packId === pack.id && p.price === packPrice && p.purchasedQuantity < p.quantity))
  packOrders.forEach(o => {
    const orderPack = o.basket.find(p => p.packId === pack.id)
    const otherPacks = o.basket.filter(p => p.packId !== pack.id)
    let orderStatus = 'e'
    if (otherPacks.length === otherPacks.filter(p => p.quantity === p.purchasedQuantity).length) {
      orderStatus = 'f'
    }
    const basket = [
      ...otherPacks, 
      {
        ...orderPack, 
        unavailableQuantity: orderPack.quantity - orderPack.purchasedQuantity
      }
    ]
    const total = basket.reduce((sum, p) => sum + ((p.actualPrice ? p.actualPrice : p.price) * (p.quantity - (p.unavailableQuantity ? p.unavailableQuantity : 0))), 0)
    if (total === 0) {
      orderStatus = 's'
    }
    const fraction = total - Math.floor(total / 50) * 50
    const orderRef = firebase.firestore().collection('orders').doc(o.id)
    batch.update(orderRef, {
      basket,
      profit: o.profit - fraction,
      total: total - fraction,
      status: orderStatus,
      statusTime: new Date()
    })
  })
  return batch.commit()
}

export const addMonthlyTrans = trans => {
  return firebase.firestore().collection('monthlyTrans').doc(trans.id).set(trans)
}

export const editOrder = (order, basket, packs) => {
  const batch = firebase.firestore().batch()
  let returnBasket = basket.filter(p => p.quantity < p.purchasedQuantity)
  if (returnBasket.length > 0){
    returnBasket = returnBasket.map(p => {
      return {
        ...p,
        quantity: p.purchasedQuantity - p.quantity,
        stores: packs.find(pa => pa.id === p.packId).stores
      }
    })
    stockIn(batch, 'i', returnBasket)
  }
  let packBasket = basket.filter(p => p.quantity > 0)
  packBasket = packBasket.map(p => {
    return ({
      ...p,
      purchasedQuantity: Math.min(p.quantity, p.purchasedQuantity),
    })
  })
  const finishedPacks = packBasket.filter(p => p.quantity === p.purchasedQuantity).length
  const purchasedPacks = packBasket.filter(p => p.purchasedQuantity > 0).length
  const total = packBasket.reduce((sum, p) => sum + ((p.actualPrice ? p.actualPrice : p.price) * (p.quantity - (p.unavailableQuantity ? p.unavailableQuantity : 0))), 0)
  const fraction = total - Math.floor(total / 50) * 50
  const profit = packBasket.reduce((sum, p) => sum + p.purchasedQuantity ? ((p.actualPrice - p.purchasePrice) * p.purchasedQuantity) : 0, 0)
  const orderRef = firebase.firestore().collection('orders').doc(order.id)
  let orderStatus = order.status
  if (packBasket.length === 0){
    if (returnBasket.length === 0){
      orderStatus = 'c'
    } else {
      orderStatus = 'i'
    }
  } else if (packBasket.length === finishedPacks){
    orderStatus = 'f'
  } else if (packBasket.length > finishedPacks && purchasedPacks > 0) {
    orderStatus = 'e'
  }
  const statusTime = orderStatus === order.status ? (order.statusTime ? order.statusTime : order.time) : new Date()
  batch.update(orderRef, {
    status: orderStatus,
    basket: packBasket,
    withDelivery: order.withDelivery,
    total: total - fraction,
    profit: profit - fraction,
    statusTime,
    editTime: new Date()
  })
  return batch.commit()
}

export const changePassword = async (oldPassword, newPassword) => {
  let user = firebase.auth().currentUser
  const email = user.email
  await firebase.auth().signInWithEmailAndPassword(email, oldPassword)
  user = firebase.auth().currentUser
  return user.updatePassword(newPassword)
}
