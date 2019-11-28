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

export const login = (email, password) => {
  return firebase.auth().signInWithEmailAndPassword(email, password)
}

export const logout = () => {
  return firebase.auth().signOut()
}

export const updateOrders = (batch, storeId, orders, basketPack, fixedFeesPercent) => {
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
    const fixedFees = total * (fixedFeesPercent / 100)
    const fraction = (total + fixedFees) - Math.floor((total + fixedFees) / 50) * 50
    const orderRef = firebase.firestore().collection('orders').doc(o.id)
    batch.update(orderRef, {
      basket,
      profit: profit - fraction,
      total,
      fixedFees,
      status: orderStatus,
      statusTime: new Date()
    })
    remainingQuantity -=  purchasedQuantity
  }
  return remainingQuantity
}

export const updateOrderStatus = (order, type, storePacks, packs, users, invitations, discountTypes) => {
  const batch = firebase.firestore().batch()
  const orderRef = firebase.firestore().collection('orders').doc(order.id)
  batch.update(orderRef, {
    status: type,
    statusTime: new Date()
  })
  if (type === 'i') {
    const basket = order.basket.filter(p => p.purchasedQuantity > 0)
    stockIn(batch, 'i', basket, storePacks, packs)
  }
  if (type === 'a'){
    order.basket.forEach(p => {
      const stock = storePacks.find(pa => pa.storeId === 's' && pa.packId === p.packId && pa.quantity > 0 && pa.price <= p.price)
      const availableQuantity = stock.quantity - (stock.reservedQuantity ? stock.reservedQuantity : 0)
      const quantity = Math.min(p.quantity, availableQuantity)
      const newReservedQuantity = (stock.reservedQuantity ? stock.reservedQuantity : 0) + quantity
      if (stock) {
        const stockRef = firebase.firestore().collection('storePacks').doc(stock.id)
        batch.update(stockRef, {
          reservedQuantity: newReservedQuantity
        })
      }
      if (newReservedQuantity === stock.quantity){
        const packInfo = packs.find(pa => pa.id === p.packId)
        if (packInfo.price === stock.price) {
          const {minPrice, weightedPrice, hasOffer} = getMinPrice(stock, packInfo, storePacks, true)
          const packRef = firebase.firestore().collection('packs').doc(packInfo.id)
          batch.update(packRef, {
            price: minPrice,
            weightedPrice,
            hasOffer
          })
        }
      }
    })
  }
  if (type === 'd'){
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
      orderLimit: firebase.firestore.FieldValue.increment(5000)
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
  const total = packBasket.reduce((sum, p) => sum + ((type === 's' ? p.price : p.purchasePrice) * p.quantity), 0)
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
    const grossPrice = stock.quantity * stock.price
    const avgPrice = (grossPrice + (basketPack.quantity * basketPack.actualPrice)) / (basketPack.quantity + stock.quantity)
    const grossPurchasePrice = stock.quantity * stock.purchasePrice
    const avgPurchasePrice = (grossPurchasePrice + (basketPack.quantity * basketPack.purchasePrice)) / (basketPack.quantity + stock.quantity)
    stock = {
      ...stock,
      price: parseInt(avgPrice), 
      purchasePrice: parseInt(avgPurchasePrice), 
      quantity: basketPack.quantity + stock.quantity, 
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

export const confirmPurchase = (basket, orders, storeId, storePacks, packs, total, discount, fixedFeesPercent) => {
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
  const approvedOrders = orders.filter(o => o.status === 'a' || o.status === 'e')
  basket.forEach(p => {
    packOrders = approvedOrders.filter(o => o.basket.find(op => op.packId === p.packId && op.price === p.price))
    packOrders.sort((o1, o2) => o1.time.seconds - o2.time.seconds)
    remainingQuantity = updateOrders(batch, storeId, packOrders, p, fixedFeesPercent)
    if (remainingQuantity > 0) {
      packsIn.push({...p, quantity: remainingQuantity})
    }
  })
  if (packsIn.length > 0) {
    stockIn(batch, 'p', packsIn, storePacks, packs, storeId)
  }
  return batch.commit()
}

export const stockOut = (basket, orders, storePacks, packs, fixedFeesPercent) => {
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
  const approvedOrders = orders.filter(o => o.status === 'a' || o.status === 'e')
  let packOrders
  basket.forEach(p => {
    packOrders = approvedOrders.filter(o => o.basket.find(op => op.packId === p.packId && op.price === p.price))
    packOrders.sort((o1, o2) => o1.time.seconds - o2.time.seconds)
    updateOrders(batch, 's', packOrders, p, fixedFeesPercent)
    packStockOut(batch, p, storePacks, packs)
  })
  return batch.commit()
}

const packStockOut = (batch, basketPack, storePacks, packs) => {
  const stock = storePacks.find(s => s.packId === basketPack.packId && s.storeId === 's')
  const storePackRef = firebase.firestore().collection('storePacks').doc(stock.id)
  if (stock.quantity > basketPack.quantity) {
    batch.update(storePackRef, {
      quantity: stock.quantity - basketPack.quantity, 
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
  let packStores = storePacks.filter(p => p.packId === pack.id)
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
    orderLimit: 10000,
    totalOrders: 0,
    totalPayments: 0,
    withDelivery: false,
    locationId: user.locationId,
    invitationsDiscount: 0,
    priceAlarmsDiscount: 0,
    isOldAge: false,
    position: '',
    isBlocked: false,
    specialDiscountPercent: 0,
    otherMobile: user.otherMobile,
    otherMobileHolder: user.otherMobileHolder,
    overPriceLimit: 0,
    time: new Date()
  })
  const userRef = firebase.firestore().collection('users').doc(user.id)
  batch.update(userRef, {
    name: user.name,
    storeName: firebase.firestore.FieldValue.delete(),
    address: firebase.firestore.FieldValue.delete()
  })
  return batch.commit()
}

export const approvePriceAlarm = (priceAlarm, pack, store, customer, storePacks, discountTypes) => {
  const batch = firebase.firestore().batch()
  const storeId = customer.storeId ? customer.storeId : store.id
  const priceAlarmRef = firebase.firestore().collection('priceAlarms').doc(priceAlarm.id)
  if (customer.storeId){
    batch.update(priceAlarmRef, {
      status: 'a'
    })  
  } else {
    batch.update(priceAlarmRef, {
      status: 'a',
      storeId
    })  
  }
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
      priceAlarmsDiscount: firebase.firestore.FieldValue.increment(discountTypes.find(t => t.id === 'p').value)
    })
  }
  return batch.commit()
}

export const rejectPriceAlarm = priceAlarm => {
  return firebase.firestore().collection('priceAlarms').doc(priceAlarm.id).update({
    status: 'r'
  })
}

export const packUnavailable = (pack, packPrice, orders, fixedFeesPercent) => {
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
    const fixedFees = total * (fixedFeesPercent / 100)
    const fraction = (total + fixedFees)- Math.floor((total + fixedFees) / 50) * 50
    const orderRef = firebase.firestore().collection('orders').doc(o.id)
    batch.update(orderRef, {
      basket,
      profit: o.profit - fraction,
      total,
      fixedFees,
      status: orderStatus,
      statusTime: new Date()
    })
  })
  return batch.commit()
}

export const addMonthlyTrans = trans => {
  return firebase.firestore().collection('monthlyTrans').doc(trans.id).set(trans)
}

export const editOrder = (order, basket, storePacks, packs, fixedFeesPercent) => {
  const batch = firebase.firestore().batch()
  let returnBasket = basket.filter(p => p.quantity < p.purchasedQuantity)
  if (returnBasket.length > 0){
    returnBasket = returnBasket.map(p => {
      return {
        ...p,
        quantity: p.purchasedQuantity - p.quantity
      }
    })
    stockIn(batch, 'i', returnBasket, storePacks, packs)
  }
  let packBasket = basket.filter(p => p.quantity > 0)
  packBasket = packBasket.map(p => {
    return {
      ...p,
      purchasedQuantity: Math.min(p.quantity, p.purchasedQuantity),
    }
  })
  const finishedPacks = packBasket.filter(p => p.quantity === p.purchasedQuantity).length
  const purchasedPacks = packBasket.filter(p => p.purchasedQuantity > 0).length
  const total = packBasket.reduce((sum, p) => sum + ((p.actualPrice ? p.actualPrice : p.price) * (p.quantity - (p.unavailableQuantity ? p.unavailableQuantity : 0))), 0)
  const fixedFees = total * (fixedFeesPercent / 100)
  const fraction = (total + fixedFees) - Math.floor((total + fixedFees) / 50) * 50
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
    total,
    profit: profit - fraction,
    fixedFees,
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

export const approveRating = (rating, product, customerInfo, discountTypes) => {
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
    rating: newRating,
    ratingCount: ratingCount + 1
  })
  const customerRef = firebase.firestore().collection('customers').doc(rating.userId)
  batch.update(customerRef, {
    ratingsDiscount: firebase.firestore.FieldValue.increment(discountTypes.find(t => t.id === 'r').value)
  })
  return batch.commit()
}
