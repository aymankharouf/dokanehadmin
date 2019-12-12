import firebase from './firebase'

export const getMessage = (error, labels, page) => {
  const errorCode = error.code ? error.code.replace(/-|\//g, '_') : error.message
  if (!labels[errorCode]) {
    firebase.firestore().collection('logs').add({
      userId: firebase.auth().currentUser.uid,
      error: error.code,
      page,
      time: new Date()
    })
  }
  return labels[errorCode] ? labels[errorCode] : labels['unknownError']
}

export const showMessage = (props, messageText) => {
  const message = props.f7router.app.toast.create({
    text: `<span class="success">${messageText}<span>`,
    closeTimeout: 3000,
  });
  message.open();
}

export const showError = (props, messageText) => {
  const message = props.f7router.app.toast.create({
    text: `<span class="error">${messageText}<span>`,
    closeTimeout: 3000,
  });
  message.open();
}

export const quantityText = (quantity, labels, weight) => {
  return `${quantity < 1 ? quantity * 1000 + ' ' + labels.gram : quantity} ${weight && weight !== quantity ? '(' + (weight < 1 ? weight * 1000 + ' ' + labels.gram : weight) + ')' : ''}`
}

export const addQuantity = (q1, q2, q3 = 0) => {
  if (parseInt(q1) !== q1 || parseInt(q2) !== q2 || parseInt(q3) !== q3) {
    return parseInt((q1 * 1000) + (q2 * 1000) + (q3 * 1000)) / 1000
  } else {
    return q1 + q2 + q3
  }
}

export const login = (email, password) => {
  return firebase.auth().signInWithEmailAndPassword(email, password)
}

export const logout = () => {
  return firebase.auth().signOut()
}

export const updateOrder = (batch, storeId, order, basketPack, fixedFeesPercent, customers, maxDiscount, margin) => {
  const orderPack = order.basket.find(p => p.packId === basketPack.packId)
  const otherPacks = order.basket.filter(p => p.packId !== basketPack.packId)
  let orderStatus = 'e'
  const orderPackQuantity = orderPack.weight ? orderPack.weight : orderPack.purchasedQuantity
  const basketPackQuantity = basketPack.weight ? basketPack.weight : basketPack.quantity
  const avgPurchasePrice = orderPackQuantity === 0 ? basketPack.purchasePrice : (parseInt(orderPack.purchasePrice * orderPackQuantity) + parseInt(basketPack.purchasePrice * basketPackQuantity)) / addQuantity(orderPackQuantity, basketPackQuantity)
  const avgActualPrice = orderPackQuantity === 0 ? basketPack.actualPrice : (parseInt(orderPack.actualPrice * orderPackQuantity) + parseInt(basketPack.actualPrice * basketPackQuantity)) / addQuantity(orderPackQuantity, basketPackQuantity)
  const weight = addQuantity(orderPack.weight ? orderPack.weight : 0, basketPack.weight)
  let status 
  if (basketPack.isDivided) {
    status = parseInt(Math.abs(addQuantity(orderPack.quantity, -1 * orderPack.purchasedQuantity, -1 * basketPack.quantity)) / orderPack.quantity * 100) <= margin ? 'f' : 'p'
  } else {
    status = orderPack.quantity === addQuantity(orderPack.purchasedQuantity, basketPack.quantity) ? 'f' : 'p'
  }
  const basket = [
    ...otherPacks, 
    {
      ...orderPack, 
      purchasedQuantity: addQuantity(orderPack.purchasedQuantity, basketPack.quantity),
      storeId: orderPack.purchasedQuantity === 0 ? storeId : 'm',
      purchasePrice: avgPurchasePrice,
      actualPrice: avgActualPrice,
      grossPrice: status === 'f' ? avgActualPrice * addQuantity(orderPackQuantity, basketPackQuantity) : avgActualPrice * addQuantity(orderPackQuantity, basketPackQuantity) + orderPack.price * addQuantity(orderPack.quantity, -1 * orderPackQuantity, -1 * basketPackQuantity),
      weight,
      status
    }
  ]
  if (basket.length === basket.filter(p => ['f', 'u', 'pu'].includes(p.status)).length) {
    orderStatus = 'f'
  }
  const customer = customers.find(c => c.id === order.userId)
  const profit = basket.reduce((sum, p) => sum + ['p', 'f', 'pu'].includes(p.status) ? ((p.actualPrice - p.purchasePrice) * (p.weight ? p.weight : p.purchasedQuantity)) : 0, 0)
  const total = basket.reduce((sum, p) => sum + p.grossPrice, 0)
  const fixedFees = parseInt(total * (fixedFeesPercent / 100))
  let discount = order.discount
  switch (discount.type) {
    case 'f':
      discount.value = fixedFees
      break;
    case 'p':
      discount.value = Math.min(customer.discounts, fixedFees, maxDiscount)
      break
    default:
  }
  const fraction = (total + fixedFees - discount.value) - Math.floor((total + fixedFees - discount.value) / 50) * 50
  const orderRef = firebase.firestore().collection('orders').doc(order.id)
  batch.update(orderRef, {
    basket,
    profit: profit - fraction,
    total,
    fixedFees,
    discount,
    status: orderStatus,
    statusTime: new Date()
  })
}

export const updateOrders = (batch, storeId, orders, basketPack, fixedFeesPercent, customers, maxDiscount) => {
  let remainingQuantity = basketPack.quantity
  let orderPack, otherPacks, purchasedQuantity, orderStatus, avgPurchasePrice, avgActualPrice
  let basket, customer, profit, total, fixedFees, discount, fraction, orderRef
  for (let o of orders){
    if (remainingQuantity <= 0) break
    orderPack = o.basket.find(p => p.packId === basketPack.packId)
    otherPacks = o.basket.filter(p => p.packId !== basketPack.packId)
    orderStatus = 'e'
    if (remainingQuantity >= addQuantity(orderPack.quantity, -1 * orderPack.purchasedQuantity)) {
      purchasedQuantity = addQuantity(orderPack.quantity, -1 * orderPack.purchasedQuantity)
    } else {
      purchasedQuantity = remainingQuantity
    }
    avgPurchasePrice = orderPack.purchasedQuantity === 0 ? basketPack.purchasePrice : (parseInt(orderPack.purchasePrice * orderPack.purchasedQuantity) + parseInt(basketPack.purchasePrice * purchasedQuantity)) / addQuantity(orderPack.purchasedQuantity, purchasedQuantity)
    avgActualPrice = orderPack.purchasedQuantity === 0 ? basketPack.actualPrice : (parseInt(orderPack.actualPrice * orderPack.purchasedQuantity) + parseInt(basketPack.actualPrice * purchasedQuantity)) / addQuantity(orderPack.purchasedQuantity, purchasedQuantity)
    const status = orderPack.quantity === addQuantity(orderPack.purchasedQuantity, purchasedQuantity) ? 'f' : 'p'
    basket = [
      ...otherPacks, 
      {
        ...orderPack, 
        purchasedQuantity: addQuantity(orderPack.purchasedQuantity, purchasedQuantity),
        storeId: orderPack.purchasedQuantity === 0 ? storeId : 'm',
        purchasePrice: avgPurchasePrice,
        actualPrice: avgActualPrice,
        grossPrice: status === 'f' ? avgActualPrice * addQuantity(orderPack.purchasedQuantity, purchasedQuantity) : avgActualPrice * addQuantity(orderPack.purchasedQuantity, purchasedQuantity) + orderPack.price * addQuantity(orderPack.quantity, -1 * orderPack.purchasedQuantity, -1 * purchasedQuantity),
        status
      }
    ]
    if (basket.length === basket.filter(p => ['f', 'u', 'pu'].includes(p.status)).length) {
      orderStatus = 'f'
    }
    customer = customers.find(c => c.id === o.userId)
    profit = basket.reduce((sum, p) => sum + ['p', 'f', 'pu'].includes(p.status) ? parseInt((p.actualPrice - p.purchasePrice) * (p.weight ? p.weight : p.purchasedQuantity)) : 0, 0)
    total = basket.reduce((sum, p) => sum + p.grossPrice, 0)
    fixedFees = parseInt(total * (fixedFeesPercent / 100))
    discount = o.discount
    switch (discount.type) {
      case 'f':
        discount.value = fixedFees
        break;
      case 'p':
        discount.value = Math.min(customer.discounts, fixedFees, maxDiscount)
        break
      default:
    }
    fraction = (total + fixedFees - discount.value) - Math.floor((total + fixedFees - discount.value) / 50) * 50
    orderRef = firebase.firestore().collection('orders').doc(o.id)
    batch.update(orderRef, {
      basket,
      profit: profit - fraction,
      total,
      fixedFees,
      discount,
      status: orderStatus,
      statusTime: new Date()
    })
    remainingQuantity -=  purchasedQuantity
  }
  return remainingQuantity
}

export const returnOrder = (order, storePacks, packs) => {
  const batch = firebase.firestore().batch()
  let basket = order.basket.filter(p => p.returnedQuantity > 0)
  basket = basket.map(p => {
    return {
      ...p,
      quantity: p.returnedQuantity
    }
  })
  stockIn(batch, 'i', basket, storePacks, packs)
  const orderRef = firebase.firestore().collection('orders').doc(order.id)
  if (order.total === 0) {
    batch.update(orderRef, {
      status: 'i',
      position: firebase.firestore.FieldValue.delete(),
      statusTime: new Date()
    })
  } else {
    batch.update(orderRef, {
      position: firebase.firestore.FieldValue.delete(),
    })
  }
  return batch.commit()
}

export const updateOrderStatus = (order, type, storePacks, packs, users, invitations, discountValue, cancelOrderId) => {
  const batch = firebase.firestore().batch()
  const orderRef = firebase.firestore().collection('orders').doc(order.id)
  if (type === 'p'){
    batch.update(orderRef, {
      status: type,
      position: 's',
      statusTime: new Date()
    })
  } else {
    batch.update(orderRef, {
      status: type,
      statusTime: new Date()
    })
  }
  if (cancelOrderId) {
    const cancelOrderRef = firebase.firestore().collection('cancelOrders').doc(cancelOrderId)
    batch.update(cancelOrderRef, {
      status: 'a'
    })  
  }
  if (type === 'i') {
    const basket = order.basket.filter(p => p.purchasedQuantity > 0)
    stockIn(batch, 'i', basket, storePacks, packs)
  }
  if (type === 'd'){
    order.basket.forEach(p => {
      const packInfo = packs.find(pa => pa.id === p.packId)
      const productRef = firebase.firestore().collection("products").doc(packInfo.productId)
      batch.update(productRef, {
        sales: firebase.firestore.FieldValue.increment(parseInt(p.quantity))
      })
    })
    const customerRef = firebase.firestore().collection('customers').doc(order.userId)
    if (order.discount.type === 'p'){
      batch.update(customerRef, {
        orderLimit: firebase.firestore.FieldValue.increment(20000),
        discounts: firebase.firestore.FieldValue.increment(-1 * order.discount.value)
      })  
    } else {
      batch.update(customerRef, {
        orderLimit: firebase.firestore.FieldValue.increment(20000)
      })  
    }
    const userInfo = users.find(u => u.id === order.userId)
    const invitedBy = invitations.find(i => i.friendMobile === userInfo.mobile)
    if (invitedBy) {
      const invitedByRef = firebase.firestore().collection('customers').doc(invitedBy.userId)
      batch.update(invitedByRef, {
        discounts: firebase.firestore.FieldValue.increment(discountValue)
      })
    }
  }
  return batch.commit()
}

const stockIn = (batch, type, basket, storePacks, packs, storeId) => {
  const transRef = firebase.firestore().collection('stockTrans').doc()
  const packBasket = basket.map(p => {
    return {
      packId: p.packId,
      price: p.actualPrice,
      quantity: p.quantity,
      purchasePrice: p.purchasePrice
    }
  })
  const total = packBasket.reduce((sum, p) => sum + parseInt((type === 'i' ? p.price : p.purchasePrice) * p.quantity), 0)
  batch.set(transRef, {
    basket: packBasket,
    storeId: storeId ? storeId : '',
    type,
    total,
    time: new Date()
  })
  basket.forEach(p => {
    packStockIn(batch, p, storePacks, packs)
  })
}

const packStockIn = (batch, basketPack, storePacks, packs) => {
  let stock = storePacks.find(p => p.packId === basketPack.packId && p.storeId === 's')
  let storePackRef
  if (stock) {
    const grossPrice = parseInt(stock.quantity * stock.price)
    const avgPrice = (grossPrice + parseInt(basketPack.quantity * basketPack.actualPrice)) / addQuantity(basketPack.quantity, stock.quantity)
    const grossPurchasePrice = stock.quantity * stock.purchasePrice
    const avgPurchasePrice = (grossPurchasePrice + parseInt(basketPack.quantity * basketPack.purchasePrice)) / addQuantity(basketPack.quantity, stock.quantity)
    stock = {
      ...stock,
      price: parseInt(avgPrice), 
      purchasePrice: parseInt(avgPurchasePrice), 
      quantity: addQuantity(basketPack.quantity, stock.quantity), 
      time: new Date()
    }
    storePackRef = firebase.firestore().collection('storePacks').doc(stock.id)
    batch.update(storePackRef, stock)
  } else {
    stock = {
      storeId: 's',
      packId: basketPack.packId,
      price: basketPack.actualPrice, 
      purchasePrice: basketPack.purchasePrice, 
      quantity: basketPack.quantity, 
      time: new Date()
    }
    storePackRef = firebase.firestore().collection('storePacks').doc()
    batch.set(storePackRef, stock)
  }
  const pack = packs.find(p => p.id === basketPack.packId)
  if (stock.price < pack.price) {
    const {minPrice, weightedPrice, hasOffer} = getMinPrice(stock, pack, storePacks, false)
    const packRef = firebase.firestore().collection('packs').doc(basketPack.packId)
    batch.update(packRef, {
      price: minPrice,
      weightedPrice,
      hasOffer
    })
  }

}

export const confirmPurchase = (basket, orders, storeId, storePacks, packs, total, discount, fixedFeesPercent, customers, maxDiscount, margin) => {
  const batch = firebase.firestore().batch()
  const purchaseRef = firebase.firestore().collection('purchases').doc()
  const packBasket = basket.map(p => {
    return {
      packId: p.packId,
      price: p.actualPrice,
      quantity: p.quantity,
      purchasePrice: p.purchasePrice,
      weight: p.weight ? p.weight : ''
    }
  })
  batch.set(purchaseRef, {
    storeId,
    basket: packBasket,
    total,
    discount: parseInt(discount * 1000),
    time: new Date()
  })
  let packOrders, remainingQuantity
  let packsIn = []
  const approvedOrders = orders.filter(o => o.status === 'a' || o.status === 'e')
  basket.forEach(p => {
    if (p.weight) {
      if (p.orderId) {
        const order = orders.find(o => o.id === p.orderId)
        updateOrder(batch, storeId, order, p, fixedFeesPercent, customers, maxDiscount, margin)
      } else {
        packsIn.push(p)
      }
    } else {
      packOrders = approvedOrders.filter(o => o.basket.find(op => op.packId === p.packId && op.price === p.price && (op.status === 'n' || op.status === 'p')))
      packOrders.sort((o1, o2) => o1.time.seconds - o2.time.seconds)
      remainingQuantity = updateOrders(batch, storeId, packOrders, p, fixedFeesPercent, customers, maxDiscount)
      if (remainingQuantity > 0) {
        packsIn.push({...p, quantity: remainingQuantity})
      }  
    }
  })
  if (packsIn.length > 0) {
      stockIn(batch, 'p', packsIn, storePacks, packs, storeId)
    }
  return batch.commit()
}

export const stockOut = (basket, orders, storePacks, packs, fixedFeesPercent, customers, maxDiscount, margin) => {
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
  const total = packBasket.reduce((sum, p) => sum + parseInt(p.price * p.quantity), 0)
  batch.set(transRef, {
    basket: packBasket,
    type: 's',
    total,
    time: new Date()
  })
  const approvedOrders = orders.filter(o => o.status === 'a' || o.status === 'e')
  let packOrders
  basket.forEach(p => {
    if (p.orderId) {
      const order = orders.find(o => o.id === p.orderId)
      updateOrder(batch, 's', order, p, fixedFeesPercent, customers, maxDiscount, margin)
    } else {
      packOrders = approvedOrders.filter(o => o.basket.find(op => op.packId === p.packId && op.price === p.price))
      packOrders.sort((o1, o2) => o1.time.seconds - o2.time.seconds)
      updateOrders(batch, 's', packOrders, p, fixedFeesPercent, customers, maxDiscount)
    }
    packStockOut(batch, p, storePacks, packs)
  })
  return batch.commit()
}

const packStockOut = (batch, basketPack, storePacks, packs) => {
  const stock = storePacks.find(s => s.packId === basketPack.packId && s.storeId === 's')
  const storePackRef = firebase.firestore().collection('storePacks').doc(stock.id)
  if (addQuantity(stock.quantity, -1 * basketPack.quantity) > 0) {
    batch.update(storePackRef, {
      quantity: addQuantity(stock.quantity, -1 * basketPack.quantity), 
    })
  } else {
    batch.update(storePackRef, {
      price: 0,
      purchasePrice: 0,
      quantity: 0, 
      time: new Date()
    })
    const pack = packs.find(p => p.id === basketPack.packId)
    if (stock.price === pack.price) {
      const {minPrice, weightedPrice, hasOffer} = getMinPrice(stock, pack, storePacks, true)
      const packRef = firebase.firestore().collection('packs').doc(basketPack.packId)
      batch.update(packRef, {
        price: minPrice,
        weightedPrice,
        hasOffer
      })
    }
  }
}

export const addStorePack = (storePack, pack, storePacks) => {
  const batch = firebase.firestore().batch()
  const storePackRef = firebase.firestore().collection('storePacks').doc()
  batch.set(storePackRef, storePack)
  if (storePack.price < pack.price || pack.price === 0) {
    const {minPrice, weightedPrice, hasOffer} = getMinPrice(storePack, pack, storePacks, false)
    const packRef = firebase.firestore().collection('packs').doc(storePack.packId)
    batch.update(packRef, {
      price: minPrice,
      weightedPrice,
      hasOffer
    })
  }
  return batch.commit()
}

export const addProduct = async product => {
  const docRef = await firebase.firestore().collection('products').add({
    name: product.name,
    category: product.category,
    trademark: product.trademark,
    country: product.country,
    isNew: product.isNew,
    isActive: true,
    sales: 0,
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
    isNew: product.isNew,
    isActive: product.isActive,
    country: product.country,
    imageUrl: url
  })
}

export const editPrice = (storePack, oldPrice, pack, storePacks) => {
  const batch = firebase.firestore().batch()
  const storePackRef = firebase.firestore().collection('storePacks').doc(storePack.id)
  batch.update(storePackRef, storePack)
  if (storePack.price < pack.price || pack.price === 0 || pack.price === oldPrice) {
    const {minPrice, weightedPrice, hasOffer} = getMinPrice(storePack, pack, storePacks, false)
    const packRef = firebase.firestore().collection('packs').doc(storePack.packId)
    batch.update(packRef, {
      price: minPrice,
      weightedPrice,
      hasOffer
    })
  }
  return batch.commit()
}

export const haltOffer = (storePack, pack, storePacks) => {
  const batch = firebase.firestore().batch()
  const storePackRef = firebase.firestore().collection('storePacks').doc(storePack.id)
  batch.update(storePackRef, {
    price: 0
  })
  if (storePack.price === pack.price) {
    const {minPrice, weightedPrice, hasOffer} = getMinPrice(storePack, pack, storePacks, true)
    const packRef = firebase.firestore().collection('packs').doc(storePack.packId)
    batch.update(packRef, {
      price: minPrice,
      weightedPrice,
      hasOffer
    })
  }
  return batch.commit()
}

export const extendOffer = storePack => {
  return firebase.firestore().collection('storePacks').doc(storePack.id).update(storePack)
}

const getMinPrice = (storePack, pack, storePacks, isDeletion) => {
  let packStores = storePacks.filter(p => p.packId === pack.id && p.price > 0)
  packStores = packStores.filter(s => s.storeId !== storePack.storeId)
  if (!isDeletion){
    packStores.push(storePack)
  }
  const prices = packStores.map(s => s.price)
  let minPrice = Math.min(...prices)
  minPrice = minPrice === Infinity ? 0 : minPrice
  const weightedPrice = pack.unitsCount ? minPrice / pack.unitsCount : 0
  const hasOffer = packStores.find(s => s.price === minPrice && s.offerEnd) ? true : false
  return {minPrice, weightedPrice, hasOffer}
}

export const refreshPackPrice = (pack, storePacks) => {
  let packStores = storePacks.filter(p => p.packId === pack.id && p.price > 0)
  const prices = packStores.map(s => s.price)
  let minPrice = Math.min(...prices)
  minPrice = minPrice === Infinity ? 0 : minPrice
  const weightedPrice = pack.unitsCount ? (minPrice / pack.unitsCount).toFixed(3) : 0
  const hasOffer = packStores.find(s => s.price === minPrice && s.offerEnd) ? true : false
  return firebase.firestore().collection('packs').doc(pack.id).update({
    price: minPrice,
    weightedPrice,
    hasOffer
  })
}

export const deleteStorePack = (storePack, pack, storePacks) => {
  const batch = firebase.firestore().batch()
  const storePackRef = firebase.firestore().collection('storePacks').doc(storePack.id)
  batch.delete(storePackRef)
  if (storePack.price === pack.price) {
    const {minPrice, weightedPrice, hasOffer} = getMinPrice(storePack, pack, storePacks, true)
    const packRef = firebase.firestore().collection('packs').doc(storePack.packId)
    batch.update(packRef, {
      price: minPrice,
      weightedPrice,
      hasOffer
    })
  }
  return batch.commit()
}

export const confirmPrice = storePack => {
  return firebase.firestore().collection('storePacks').doc(storePack.id).update({
    time: new Date()
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
    name: user.name,
    storeId: user.storeId,
    address: user.address,
    orderLimit: 20000,
    withDelivery: false,
    locationId: user.locationId,
    discounts: 0,
    isOldAge: false,
    position: '',
    isBlocked: false,
    otherMobile: user.otherMobile,
    otherMobileHolder: user.otherMobileHolder,
    overPriceLimit: 0,
    time: new Date()
  })
  const userRef = firebase.firestore().collection('users').doc(user.id)
  batch.update(userRef, {
    name: user.name,
    storeName: firebase.firestore.FieldValue.delete(),
    locationId: firebase.firestore.FieldValue.delete()
  })
  return batch.commit()
}

export const approvePriceAlarm = (priceAlarm, pack, store, customer, storePacks, discountValue) => {
  const batch = firebase.firestore().batch()
  const storeId = customer.storeId ? customer.storeId : store.id
  const priceAlarmRef = firebase.firestore().collection('priceAlarms').doc(priceAlarm.id)
  batch.update(priceAlarmRef, {
    status: 'a',
    storeId: customer.storeId ? '' : store.id
  })  
  const storePack = storePacks.find(p => p.storeId === storeId && p.packId === priceAlarm.packId)
  const oldPrice = storePack.price
  if (priceAlarm.price > 0) {
    const newStorePack = { 
      ...storePack,
      storeId,
      purchasePrice: priceAlarm.price,
      price: priceAlarm.price,
      userId: priceAlarm.userId,
      offerEnd: priceAlarm.offerEnd,
      time: new Date(),
    }
    const storePackRef = firebase.firestore().collection('storePacks').doc(storePack.id)
    batch.update(storePackRef, newStorePack)
    if (newStorePack.price < pack.price || pack.price === 0 || pack.price === oldPrice) {
      const {minPrice, weightedPrice, hasOffer} = getMinPrice(newStorePack, pack, storePacks, false)
      const packRef = firebase.firestore().collection('packs').doc(storePack.packId)
      batch.update(packRef, {
        price: minPrice,
        weightedPrice,
        hasOffer
      })
    }
  } else {
    const storePackRef = firebase.firestore().collection('storePacks').doc(storePack.id)
    batch.delete(storePackRef)
    if (storePack.price === pack.price) {
      const {minPrice, weightedPrice, hasOffer} = getMinPrice(storePack, pack, storePacks, true)
      const packRef = firebase.firestore().collection('packs').doc(storePack.packId)
      batch.update(packRef, {
        price: minPrice,
        weightedPrice,
        hasOffer
      })
    }
  }
  if (!customer.storeId){
    const customerRef = firebase.firestore().collection('customers').doc(customer.id)
    batch.update(customerRef, {
      discounts: firebase.firestore.FieldValue.increment(discountValue)
    })
  }
  return batch.commit()
}

export const rejectPriceAlarm = priceAlarm => {
  return firebase.firestore().collection('priceAlarms').doc(priceAlarm.id).update({
    status: 'r'
  })
}

export const packUnavailable = (pack, packPrice, orders, fixedFeesPercent, customers, maxDiscount, overPriced) => {
  const batch = firebase.firestore().batch()
  const packOrders = orders.filter(o => o.basket.find(p => p.packId === pack.id && p.price === packPrice && (p.status === 'n' || p.status === 'p')))
  packOrders.forEach(o => {
    const orderPack = o.basket.find(p => p.packId === pack.id)
    const otherPacks = o.basket.filter(p => p.packId !== pack.id)
    let orderStatus = 'e'
    const basket = [
      ...otherPacks, 
      {
        ...orderPack,
        status: orderPack.purchasedQuantity > 0 ? 'pu' : 'u',
        grossPrice: parseInt(orderPack.actualPrice * (orderPack.weight ? orderPack.weight : orderPack.purchasedQuantity)),
        overPriced
      }
    ]
    if (basket.length === basket.filter(p => p.status === 'u').length) {
      orderStatus = 'u'
    }else if (basket.length === basket.filter(p => ['f', 'u', 'pu'].includes(p.status)).length) {
      orderStatus = 'f'
    }
    const customer = customers.find(c => c.id === o.userId)
    const total = basket.reduce((sum, p) => sum + p.grossPrice, 0)
    let fixedFees, fraction, discount, profit
    if (total === 0) {
      orderStatus = 's'
      fixedFees = 0
      fraction = 0
      profit = 0
      discount.value = 0
      discount.type = ''
    } else {
      profit = basket.reduce((sum, p) => sum + ['p', 'f', 'pu'].includes(p.status) ? parseInt((p.actualPrice - p.purchasePrice) * (p.weight ? p.weight : p.purchasedQuantity)) : 0, 0)
      fixedFees = parseInt(total * (fixedFeesPercent / 100))
      discount = o.discount
      switch (discount.type) {
        case 'f':
          discount.value = fixedFees
          break
        case 'p':
          discount.value = Math.min(customer.discounts, fixedFees, maxDiscount)
          break
        default:
      }
      fraction = (total + fixedFees - discount.value) - Math.floor((total + fixedFees - discount.value) / 50) * 50
    }
    const orderRef = firebase.firestore().collection('orders').doc(o.id)
    batch.update(orderRef, {
      basket,
      profit: profit - fraction,
      total,
      fixedFees,
      discount,
      status: orderStatus,
      statusTime: new Date()
    })
  })
  return batch.commit()
}

export const addMonthlyTrans = trans => {
  return firebase.firestore().collection('monthlyTrans').doc(trans.id).set(trans)
}

export const editOrder = (order, basket, storePacks, packs, fixedFeesPercent, customer, maxDiscount) => {
  const batch = firebase.firestore().batch()
  let returnBasket = basket.filter(p => p.quantity < p.purchasedQuantity)
  if (returnBasket.length > 0){
    returnBasket = returnBasket.map(p => {
      return {
        ...p,
        quantity: addQuantity(p.purchasedQuantity, p.quantity)
      }
    })
    stockIn(batch, 'i', returnBasket, storePacks, packs)
  }
  let packBasket = basket.filter(p => p.quantity > 0)
  packBasket = packBasket.map(p => {
    const status = p.quantity === p.purchasedQuantity ? 'f' : p.purchasedQuantity > 0 ? 'p' : 'n'
    return {
      ...p,
      purchasedQuantity: Math.min(p.quantity, p.purchasedQuantity),
      status,
      grossPrice: status === 'n' ? parseInt(p.price * p.quantity) : parseInt(p.actualPrice * (p.weight ? p.weight : p.purchasedQuantity)) + parseInt(p.price * addQuantity(p.quantity, -1 * p.purchasedQuantity))
    }
  })
  const total = packBasket.reduce((sum, p) => sum + p.grossPrice, 0)
  const fixedFees = parseInt(total * (fixedFeesPercent / 100))
  let discount = order.discount
  switch (discount.type) {
    case 'f':
      discount.value = fixedFees
      break;
    case 'p':
      discount.value = Math.min(customer.discounts, fixedFees, maxDiscount)
      break
    default:
  }
  const fraction = (total + fixedFees - discount.value) - Math.floor((total + fixedFees - discount.value) / 50) * 50
  const profit = packBasket.reduce((sum, p) => sum + ['p', 'f', 'pu'].includes(p.status) ? parseInt((p.actualPrice - p.purchasePrice) * (p.weight ? p.weight : p.purchasedQuantity)) : 0, 0)
  const orderRef = firebase.firestore().collection('orders').doc(order.id)
  let orderStatus = order.status
  if (packBasket.length === 0){
    if (returnBasket.length === 0){
      orderStatus = 'c'
    } else {
      orderStatus = 'i'
    }
  } else if (packBasket.length === packBasket.filter(p => p.status === 'f').length){
    orderStatus = 'f'
  } else if (packBasket.filter(p => p.purchasedQuantity > 0).length > 0) {
    orderStatus = 'e'
  }
  const statusTime = orderStatus === order.status ? (order.statusTime ? order.statusTime : order.time) : new Date()
  batch.update(orderRef, {
    status: orderStatus,
    basket: packBasket,
    withDelivery: order.withDelivery,
    total,
    profit: profit - fraction,
    fixedFees,
    discount,
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

export const approveRating = (rating, product, customerInfo, discountValue) => {
  const batch = firebase.firestore().batch()
  const ratingRef = firebase.firestore().collection('ratings').doc(rating.id)
  batch.update(ratingRef, {
    status: 'a',
    userName: customerInfo.name
  })
  const oldRating = product.rating ? product.rating : 0
  const ratingCount = product.ratingCount ? product.ratingCount : 0
  const newRating = ((oldRating * ratingCount) + (rating.value * 5)) / (ratingCount + 1)
  const productRef = firebase.firestore().collection("products").doc(rating.productId)
  batch.update(productRef, {
    rating: Math.round(newRating * 2) / 2,
    ratingCount: ratingCount + 1
  })
  const customerRef = firebase.firestore().collection('customers').doc(rating.userId)
  batch.update(customerRef, {
    discounts: firebase.firestore.FieldValue.increment(discountValue)
  })
  return batch.commit()
}

export const sendOrder = (order, position) => {
  return firebase.firestore().collection('orders').doc(order.id).update({
    position
  })
}

export const returnOrderPacks = (order, pack, returnedQuantity, fixedFeesPercent, customers, maxDiscount, margin) => {
  const batch = firebase.firestore().batch()
  const orderPack = order.basket.find(p => p.packId === pack.id)
  const otherPacks = order.basket.filter(p => p.packId !== pack.id)
  let status
  let grossPrice
  if (returnedQuantity === 0 && orderPack.returnedQuantity > 0) {
    if (pack.isDivided) {
      status = parseInt(Math.abs(addQuantity(orderPack.quantity, -1 * orderPack.purchasedQuantity)) / orderPack.quantity * 100) <= margin ? 'f' : 'pu'
    } else {
      status = orderPack.quantity === orderPack.purchasedQuantity ? 'f' : 'pu'
    }
    grossPrice = parseInt(orderPack.actualPrice * (orderPack.weight ? orderPack.weight : orderPack.purchasedQuantity))
  } else {
    if (returnedQuantity === (orderPack.weight ? orderPack.weight : orderPack.purchasedQuantity)) {
      status = 'r'
      grossPrice = 0
    } else {
      status = 'pr'
      grossPrice = parseInt(orderPack.actualPrice * addQuantity(orderPack.weight ? orderPack.weight : orderPack.purchasedQuantity, -1 * returnedQuantity))
    }
  }
  const basket = [
    ...otherPacks, 
    {
      ...orderPack, 
      status,
      grossPrice,
      returnedQuantity: pack.isDivided || !pack.byWeight ? returnedQuantity : orderPack.purchasedQuantity
    }
  ]
  const customer = customers.find(c => c.id === order.userId)
  const total = basket.reduce((sum, p) => sum + p.grossPrice, 0)
  const fixedFees = parseInt(total * (fixedFeesPercent / 100))
  let discount = order.discount
  switch (discount.type) {
    case 'f':
      discount.value = fixedFees
      break;
    case 'p':
      discount.value = Math.min(customer.discounts < 0 ? 0 : customer.discounts, fixedFees, maxDiscount)
      break
    default:
  }
  let returnedValue = parseInt(returnedQuantity * orderPack.purchasePrice / 100)
  if (discount.value > 0){
    if (discount.value >=  returnedValue){
      discount.value = discount.value - returnedValue
      returnedValue = 0
    } else {
      discount.value = 0
      discount.type = ''
      returnedValue = returnedValue - discount.value
    }
  }
  const fraction = (total + fixedFees - discount.value) - Math.floor((total + fixedFees - discount.value) / 50) * 50
  const profit = basket.reduce((sum, p) => sum + ['p', 'f', 'pu', 'pr'].includes(p.status) ? parseInt((p.actualPrice - p.purchasePrice) * addQuantity(p.weight ? p.weight : p.purchasedQuantity, -1 * (p.returnedQuantity ? p.returnedQuantity : 0))) : 0, 0)
  const orderRef = firebase.firestore().collection('orders').doc(order.id)
  batch.update(orderRef, {
    basket,
    total,
    profit: profit - fraction,
    fixedFees,
    discount
  })
  if (returnedValue > 0) {
    const customerRef = firebase.firestore().collection('customers').doc(order.userId)
    batch.update(customerRef, {
      discounts: firebase.firestore.FieldValue.increment(-1 * returnedValue)
    })    
  }
  return batch.commit()
}

export const addStockTrans = (type, packId, quantity, purchasePrice, price, storePacks, packs, storeId) => {
  const batch = firebase.firestore().batch()
  const transRef = firebase.firestore().collection('stockTrans').doc()
  const packBasket = {
    packId,
    price,
    quantity,
    purchasePrice
  }
  const total = parseInt(price * quantity)
  batch.set(transRef, {
    basket: [packBasket],
    storeId: storeId ? storeId : '',
    type,
    total,
    time: new Date()
  })
  packStockOut(batch, packBasket, storePacks, packs)
  return batch.commit()
}