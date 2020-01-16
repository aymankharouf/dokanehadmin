import firebase from './firebase'
import labels from './labels'
import { f7 } from 'framework7-react'
import { setup } from './config'
import moment from 'moment'

export const getMessage = (props, error) => {
  const errorCode = error.code ? error.code.replace(/-|\//g, '_') : error.message
  if (!labels[errorCode]) {
    firebase.firestore().collection('logs').add({
      userId: firebase.auth().currentUser.uid,
      error: error.code,
      page: props.f7route.route.component.name,
      time: new Date()
    })
  }
  return labels[errorCode] ? labels[errorCode] : labels['unknownError']
}

export const showMessage = messageText => {
  const message = f7.toast.create({
    text: `<span class="success">${messageText}<span>`,
    closeTimeout: 3000,
  })
  message.open()
}

export const showError = messageText => {
  const message = f7.toast.create({
    text: `<span class="error">${messageText}<span>`,
    closeTimeout: 3000,
  })
  message.open()
}

export const quantityText = quantity => {
  return quantity < 1 ? `${quantity * 1000} ${labels.gram}` : String(quantity)
}

export const quantityDetails = basketPack => {
  let text = `${labels.requested}: ${quantityText(basketPack.quantity)}`
  if (basketPack.purchased > 0) {
    text += `, ${labels.purchased}: ${quantityText(basketPack.purchased)}`
    if (basketPack.weight && basketPack.weight !== basketPack.purchased) {
      text += `, ${labels.weight}: ${quantityText(basketPack.weight)}`
    }
  }
  if (basketPack.returned > 0) {
    text += `, ${labels.returned}: ${quantityText(basketPack.returned)}`
  }
  return text
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

export const updateOrder = (batch, storeId, order, basketPack, currentPrice, customers, purchaseId) => {
  const orderPack = order.basket.find(p => p.packId === basketPack.packId)
  let actual, customerInfo
  if (orderPack.price < basketPack.actual) {
    if (basketPack.exceedPriceType === 'p' && orderPack.price < currentPrice){
      customerInfo = customers.find(c => c.id === order.userId)
      if (customerInfo.exceedPrice && parseInt(orderPack.price * (1 + setup.exceedPricePercent)) >= basketPack.actual){
        actual = basketPack.actual
      } else {
        return
      }
    } else if (basketPack.exceedPriceType === 'o') {
      actual = orderPack.price
    } else {
      return
    }
  } else {
    actual = basketPack.actual
  }
  const otherPacks = order.basket.filter(p => p.packId !== basketPack.packId)
  let orderStatus = 'e'
  const orderPackQuantity = orderPack.weight || 0
  const newWeight = addQuantity(orderPack.weight || 0, basketPack.weight)
  const newPurchased = addQuantity(orderPack.purchased, basketPack.quantity)
  const avgCost = orderPackQuantity === 0 ? basketPack.cost : parseInt((orderPack.cost * orderPackQuantity + basketPack.cost * basketPack.weight) / newWeight)
  const avgActual = orderPackQuantity === 0 ? actual : parseInt((orderPack.actual * orderPackQuantity + basketPack.actual * basketPack.weight) / newWeight)
  let status 
  if (basketPack.isDivided) {
    status = parseInt(Math.abs(addQuantity(orderPack.quantity, -1 * orderPack.purchased, -1 * basketPack.quantity)) / orderPack.quantity * 100) <= setup.weightErrorMargin ? 'f' : 'p'
  } else {
    status = orderPack.quantity === addQuantity(orderPack.purchased, basketPack.quantity) ? 'f' : 'p'
  }
  const basket = [
    ...otherPacks, 
    {
      ...orderPack, 
      purchased: newPurchased,
      storeId: orderPack.storeId && orderPack.storeId !== storeId ? 'm' : storeId,
      cost: avgCost,
      actual: avgActual,
      gross: status === 'f' ? parseInt(avgActual * newWeight) : parseInt(avgActual * newWeight) + parseInt(orderPack.price * addQuantity(orderPack.quantity, -1 * newPurchased)),
      weight: newWeight,
      status,
      lastPurchaseId: purchaseId,
      lastPurchased: basketPack.quantity,
      lastWeight: basketPack.weight,
      prevStoreId: orderPack.storeId
    }
  ]
  if (basket.length === basket.filter(p => ['f', 'u', 'pu'].includes(p.status)).length) {
    orderStatus = 'f'
  }
  let profit = basket.reduce((sum, p) => sum + ['p', 'f', 'pu'].includes(p.status) ? ((p.actual - p.cost) * (p.weight || p.purchased)) : 0, 0)
  const total = basket.reduce((sum, p) => sum + (p.gross || 0), 0)
  const fraction = total - Math.floor(total / 50) * 50
  const fixedFees = Math.ceil((order.urgent ? 1.5 : 1) * setup.fixedFees * total / 50) * 50 - fraction
  const orderRef = firebase.firestore().collection('orders').doc(order.id)
  batch.update(orderRef, {
    basket,
    profit,
    total,
    fixedFees,
    status: orderStatus,
    lastUpdate: new Date()
  })
}

export const updateOrders = (batch, storeId, orders, basketPack, currentPrice, customers, purchaseId) => {
  let remaining = basketPack.quantity
  let orderPack, otherPacks, purchased, orderStatus, avgCost, avgActual, status
  let basket, profit, total, fixedFees, fraction, orderRef, customerInfo, actual
  for (let o of orders){
    if (remaining <= 0) break
    orderPack = o.basket.find(p => p.packId === basketPack.packId)
    if (orderPack.price < basketPack.actual) {
      if (basketPack.exceedPriceType === 'p' && orderPack.price < currentPrice){
        customerInfo = customers.find(c => c.id === o.userId)
        if (customerInfo.exceedPrice && parseInt(orderPack.price * (1 + setup.exceedPricePercent)) >= basketPack.actual){
          actual = basketPack.actual
        } else {
          break
        }
      } else if (basketPack.exceedPriceType === 'o'){
        actual = orderPack.price
      } else {
        break
      }
    } else {
      actual = basketPack.actual
    }
    otherPacks = o.basket.filter(p => p.packId !== basketPack.packId)
    orderStatus = 'e'
    if (remaining >= addQuantity(orderPack.quantity, -1 * orderPack.purchased)) {
      purchased = addQuantity(orderPack.quantity, -1 * orderPack.purchased)
    } else {
      purchased = remaining
    }
    avgCost = orderPack.purchased === 0 ? basketPack.cost : parseInt((orderPack.cost * orderPack.purchased + basketPack.cost * purchased) / addQuantity(orderPack.purchased, purchased))
    avgActual = orderPack.purchased === 0 ? actual : parseInt((orderPack.actual * orderPack.purchased + actual * purchased) / addQuantity(orderPack.purchased, purchased))
    status = orderPack.quantity === addQuantity(orderPack.purchased, purchased) ? 'f' : 'p'
    basket = [
      ...otherPacks, 
      {
        ...orderPack, 
        purchased: addQuantity(orderPack.purchased, purchased),
        storeId: orderPack.storeId && orderPack.storeId !== storeId ? 'm' : storeId,
        cost: avgCost,
        actual: avgActual,
        gross: status === 'f' ? avgActual * addQuantity(orderPack.purchased, purchased) : avgActual * addQuantity(orderPack.purchased, purchased) + orderPack.price * addQuantity(orderPack.quantity, -1 * orderPack.purchased, -1 * purchased),
        status,
        lastPurchaseId: purchaseId,
        lastPurchased: purchased,
        prevStoreId: orderPack.storeId || ''
      }
    ]
    if (basket.length === basket.filter(p => ['f', 'u', 'pu'].includes(p.status)).length) {
      orderStatus = 'f'
    }
    profit = basket.reduce((sum, p) => sum + ['p', 'f', 'pu'].includes(p.status) ? parseInt((p.actual - p.cost) * (p.weight ? p.weight : p.purchased)) : 0, 0)
    total = basket.reduce((sum, p) => sum + (p.gross || 0), 0)
    fraction = total - Math.floor(total / 50) * 50
    fixedFees = Math.ceil((o.urgent ? 1.5 : 1) * setup.fixedFees * total / 50) * 50 - fraction  
    orderRef = firebase.firestore().collection('orders').doc(o.id)
    batch.update(orderRef, {
      basket,
      profit,
      total,
      fixedFees,
      status: orderStatus,
      lastUpdate: new Date()
    })
    remaining -=  purchased
  }
  return remaining
}

export const returnOrder = (order, storePacks, packs) => {
  const batch = firebase.firestore().batch()
  let basket = order.basket.filter(p => p.returned > 0)
  basket = basket.map(p => {
    return {
      ...p,
      quantity: p.returned
    }
  })
  stockIn(batch, 'i', basket, storePacks, packs)
  const orderRef = firebase.firestore().collection('orders').doc(order.id)
  if (order.total === 0) {
    batch.update(orderRef, {
      status: 'i',
      position: firebase.firestore.FieldValue.delete(),
      lastUpdate: new Date()
    })
  } else {
    batch.update(orderRef, {
      position: firebase.firestore.FieldValue.delete()
    })
  }
  const returnedPenalty = basket.length * setup.returnPenalty
  if (returnedPenalty > 0) {
    const customerRef = firebase.firestore().collection('customers').doc(order.userId)
    batch.update(customerRef, {
      discounts: firebase.firestore.FieldValue.increment(-1 * returnedPenalty),
      returnedCount: firebase.firestore.FieldValue.increment(basket.length)
    })    
  }
  return batch.commit()
}

export const updateOrderStatus = (order, type, storePacks, packs, calls, users, invitations, blockUserFlag, batch) => {
  const newBatch = batch || firebase.firestore().batch()
  const orderRef = firebase.firestore().collection('orders').doc(order.id)
  newBatch.update(orderRef, {
    status: type,
    lastUpdate: new Date()
  })
  let customerRef
  if (type === 'a') {
    customerRef = firebase.firestore().collection('customers').doc(order.userId)
    newBatch.update(customerRef, {
      ordersCount: firebase.firestore.FieldValue.increment(1)
    }) 
    if (order.discount > 0 && order.discount < setup.firstOrderDiscount) { //not first order
      newBatch.update(customerRef, {
        discounts: firebase.firestore.FieldValue.increment(-1 * order.discount)
      })  
    }
    sendNotification(newBatch, order.userId, labels.approveOrderNotification)
  } else if (type === 'c') {
    if (order.discount > 0 && order.discount < setup.firstOrderDiscount) { //not first order
      customerRef = firebase.firestore().collection('customers').doc(order.userId)
      newBatch.update(customerRef, {
        discounts: firebase.firestore.FieldValue.increment(order.discount)
      })  
    }
  } else if (type === 'i') {
    const basket = order.basket.filter(p => p.purchased > 0)
    stockIn(newBatch, 'i', basket, storePacks, packs)
    if (blockUserFlag) {
      customerRef = firebase.firestore().collection('customers').doc(order.userId)
      batch.update(customerRef, {
        isBlocked: true
      })
      sendNotification(newBatch, order.userId, labels.blockCustomerNotification)
    }
    deleteCalls(newBatch, order, calls)
  } else if (type === 'd'){
    order.basket.forEach(p => {
      const packInfo = packs.find(pa => pa.id === p.packId)
      const productRef = firebase.firestore().collection('products').doc(packInfo.productId)
      newBatch.update(productRef, {
        sales: firebase.firestore.FieldValue.increment(p.purchased)
      })
      const affectedPacks = packs.filter(pa => pa.productId === packInfo.productId)
      affectedPacks.forEach(pa => {
        const packRef = firebase.firestore().collection('packs').doc(pa.id)
        batch.update(packRef, {
          sales: firebase.firestore.FieldValue.increment(p.purchased)
        })
      })
    })
    customerRef = firebase.firestore().collection('customers').doc(order.userId)
    newBatch.update(customerRef, {
      deliveredOrdersCount: firebase.firestore.FieldValue.increment(1),
      deliveredOrdersTotal: firebase.firestore.FieldValue.increment(order.total)
    })  
    const userInfo = users.find(u => u.id === order.userId)
    const invitedBy = invitations.find(i => i.friendMobile === userInfo.mobile && i.status === 'a')
    if (invitedBy) {
      customerRef = firebase.firestore().collection('customers').doc(invitedBy.userId)
      newBatch.update(customerRef, {
        discounts: firebase.firestore.FieldValue.increment(setup.invitationDiscount)
      })
    }
    if (order.position === 's' && !order.basket.find(p => p.returned > 0)) {
      newBatch.update(orderRef, {
        position: firebase.firestore.FieldValue.delete()
      })
    }
    deleteCalls(newBatch, order, calls)
  }
  if (!batch) {
    return newBatch.commit()
  }
}

const stockIn = (batch, type, basket, storePacks, packs, storeId, purchaseId) => {
  const transRef = firebase.firestore().collection('stock-trans').doc()
  const newBasket = basket.map(p => {
    return {
      packId: p.packId,
      price: parseInt(p.cost * (1 + setup.profit)),
      quantity: p.quantity,
      cost: p.cost
    }
  })
  const total = newBasket.reduce((sum, p) => sum + parseInt(p.cost * p.quantity), 0)
  batch.set(transRef, {
    basket: newBasket,
    storeId: storeId || '',
    purchaseId: purchaseId || '',
    type,
    total,
    time: new Date()
  })
  newBasket.forEach(p => {
    packStockIn(batch, p, storePacks, packs)
  })
}

const packStockIn = (batch, basketPack, storePacks, packs) => {
  let stock = storePacks.find(p => p.packId === basketPack.packId && p.storeId === 's')
  let storePackRef, newStock
  if (stock) {
    const avgPrice = parseInt((stock.quantity * stock.price + basketPack.quantity * basketPack.price) / addQuantity(basketPack.quantity, stock.quantity))
    const avgCost = parseInt((stock.quantity * stock.cost + basketPack.quantity * basketPack.cost) / addQuantity(basketPack.quantity, stock.quantity))
    newStock = {
      ...stock,
      price: avgPrice, 
      cost: avgCost, 
      quantity: addQuantity(basketPack.quantity, stock.quantity), 
      time: new Date()
    }
    storePackRef = firebase.firestore().collection('store-packs').doc(stock.id)
    batch.update(storePackRef, newStock)
  } else {
    newStock = {
      storeId: 's',
      packId: basketPack.packId,
      price: basketPack.price, 
      cost: basketPack.cost, 
      quantity: basketPack.quantity, 
      time: new Date()
    }
    storePackRef = firebase.firestore().collection('store-packs').doc()
    batch.set(storePackRef, newStock)
  }
  const pack = packs.find(p => p.id === basketPack.packId)
  if (!stock || stock.price === pack.price || newStock.price < pack.price) {
    const { minPrice, minStoreId, weightedPrice, offerEnd } = getMinPrice(newStock, pack, storePacks, packs, false)
    const packRef = firebase.firestore().collection('packs').doc(basketPack.packId)
    batch.update(packRef, {
      price: minPrice,
      weightedPrice,
      offerEnd,
      minStoreId
    })
  }
}

export const confirmPurchase = (basket, orders, storeId, storePacks, packs, customers, total, discount) => {
  const batch = firebase.firestore().batch()
  const purchaseRef = firebase.firestore().collection('purchases').doc()
  const packBasket = basket.map(p => {
    let newPack = {
      packId: p.packId,
      price: p.actual,
      quantity: p.quantity,
      cost: p.cost
    }
    if (p.weight) newPack['weight'] = p.weight
    return newPack
  })
  batch.set(purchaseRef, {
    storeId,
    basket: packBasket,
    total,
    discount: parseInt(discount * 1000),
    time: new Date()
  })
  let packOrders, remaining, packInfo, pack, quantity
  let packsIn = []
  const approvedOrders = orders.filter(o => o.status === 'a' || o.status === 'e')
  basket.forEach(p => {
    packInfo = packs.find(pa => pa.id === p.packId)
    if (p.weight) {
      if (p.orderId) {
        const order = orders.find(o => o.id === p.orderId)
        updateOrder(batch, storeId, order, p, packInfo.price, customers, purchaseRef.id)
      } else {
        packsIn.push(p)
      }
    } else {
      packOrders = approvedOrders.filter(o => o.basket.find(op => op.packId === p.packId && op.price === p.price && (op.status === 'n' || op.status === 'p')))
      packOrders.sort((o1, o2) => o1.time.seconds - o2.time.seconds)
      remaining = updateOrders(batch, storeId, packOrders, p, packInfo.price, customers, purchaseRef.id)
      if (remaining > 0) {
        if (packInfo.subPackId) {
          pack = {
            packId: packInfo.subPackId,
            quantity: remaining * packInfo.subQuantity,
            cost: parseInt(p.cost / packInfo.subQuantity * packInfo.subPercent),
            actual: parseInt(p.actual / packInfo.subQuantity * packInfo.subPercent),
            isOffer: p.isOffer,
            exceedPriceType: p.exceedPriceType
          }
          packOrders = approvedOrders.filter(o => o.basket.find(op => op.packId === packInfo.subPackId && op.price === p.price && (op.status === 'n' || op.status === 'p')))
          packOrders.sort((o1, o2) => o1.time.seconds - o2.time.seconds)
          quantity = updateOrders(batch, storeId, packOrders, pack, packs.find(pa => pa.id === packInfo.subPackId).price, customers, purchaseRef.id)
          if (quantity > 0) {
            packsIn.push({...pack, quantity})
          }
          if (packInfo.bonusPackId){
            pack = {
              packId: packInfo.bonusPackId,
              quantity: remaining * packInfo.bonusQuantity,
              cost: parseInt(p.cost / packInfo.bonusQuantity * packInfo.bonusPercent),
              actual: parseInt(p.actual / packInfo.bonusQuantity * packInfo.bonusPercent),
              isOffer: p.isOffer,
              exceedPriceType: p.exceedPriceType
            }
            packOrders = approvedOrders.filter(o => o.basket.find(op => op.packId === packInfo.bonusPackId && op.price === p.price && (op.status === 'n' || op.status === 'p')))
            packOrders.sort((o1, o2) => o1.time.seconds - o2.time.seconds)
            quantity = updateOrders(batch, storeId, packOrders, pack, packs.find(pa => pa.id === packInfo.bonusPackId).price, customers, purchaseRef.id)
            if (quantity > 0) {
              packsIn.push({...pack, quantity})
            }
          }
        } else {
          packsIn.push({...p, quantity: remaining})
        }
      }
    }
  })
  if (packsIn.length > 0) {
      stockIn(batch, 'p', packsIn, storePacks, packs, storeId, purchaseRef.id)
    }
  return batch.commit()
}

export const stockOut = (basket, orders, storePacks, packs, customers) => {
  const batch = firebase.firestore().batch()
  const transRef = firebase.firestore().collection('stock-trans').doc()
  const packBasket = basket.map(p => {
    return {
      packId: p.packId,
      price: p.actual,
      quantity: p.quantity,
      cost: p.cost
    }
  })
  const total = packBasket.reduce((sum, p) => sum + parseInt(p.price * p.quantity), 0)
  batch.set(transRef, {
    basket: packBasket,
    type: 'r',
    total,
    time: new Date()
  })
  const approvedOrders = orders.filter(o => o.status === 'a' || o.status === 'e')
  basket.forEach(p => {
    const packInfo = packs.find(pa => pa.id === p.packId)
    if (p.orderId) {
      const order = orders.find(o => o.id === p.orderId)
      updateOrder(batch, 's', order, p, packInfo.price, customers)
    } else {
      let packOrders = approvedOrders.filter(o => o.basket.find(op => op.packId === p.packId && op.price === p.price))
      packOrders.sort((o1, o2) => o1.time.seconds - o2.time.seconds)
      updateOrders(batch, 's', packOrders, p, packInfo.price, customers)
    }
    packStockOut(batch, p, storePacks, packs)
  })
  return batch.commit()
}

const packStockOut = (batch, basketPack, storePacks, packs) => {
  const stock = storePacks.find(s => s.packId === basketPack.packId && s.storeId === 's')
  const storePackRef = firebase.firestore().collection('store-packs').doc(stock.id)
  if (addQuantity(stock.quantity, -1 * basketPack.quantity) > 0) {
    batch.update(storePackRef, {
      quantity: addQuantity(stock.quantity, -1 * basketPack.quantity), 
    })
  } else {
    batch.update(storePackRef, {
      price: 0,
      cost: 0,
      quantity: 0, 
      time: new Date()
    })
    const pack = packs.find(p => p.id === basketPack.packId)
    const { minPrice, minStoreId, weightedPrice, offerEnd } = getMinPrice(stock, pack, storePacks, packs, true)
    const packRef = firebase.firestore().collection('packs').doc(basketPack.packId)
    batch.update(packRef, {
      price: minPrice,
      weightedPrice,
      offerEnd,
      minStoreId
    })
  }
}

export const addStorePack = (storePack, pack, storePacks, packs) => {
  const batch = firebase.firestore().batch()
  const storePackRef = firebase.firestore().collection('store-packs').doc()
  batch.set(storePackRef, storePack)
  const storeRef = firebase.firestore().collection('stores').doc(storePack.storeId)
  batch.update(storeRef, {
    lastUpdate: new Date()
  })
  let newPack = pack
  if (storePack.cost !== storePack.price && storePack.storeId !== 's' && pack.subPackId) { //from type 5
    newPack = packs.find(p => p.id === pack.subPackId)
  } 
  if (storePack.price < newPack.price || newPack.price === 0) {
    const { minPrice, minStoreId, weightedPrice, offerEnd } = getMinPrice(storePack, newPack, storePacks, packs, false)
    const packRef = firebase.firestore().collection('packs').doc(newPack.id)
    batch.update(packRef, {
      price: minPrice,
      weightedPrice,
      offerEnd,
      minStoreId
    })
  }
  return batch.commit()
}

export const addProduct = async (product, image) => {
  const productRef = await firebase.firestore().collection('products').add(product)
  const filename = image.name
  const ext = filename.slice(filename.lastIndexOf('.'))
  const fileData = await firebase.storage().ref().child('products/' + productRef.id + ext).put(image)
  const url = await firebase.storage().ref().child(fileData.metadata.fullPath).getDownloadURL()
  return firebase.firestore().collection('products').doc(productRef.id).update({imageUrl: url})
}

export const editProduct = async (product, image, packs) => {
  const batch = firebase.firestore().batch()
  let url
  if (image) {
    const filename = image.name
    const ext = filename.slice(filename.lastIndexOf('.'))
    const fileData = await firebase.storage().ref().child('products/' + product.id + ext).put(image)
    url = await firebase.storage().ref().child(fileData.metadata.fullPath).getDownloadURL()
  } else {
    url = product.imageUrl
  }
  const productRef = firebase.firestore().collection('products').doc(product.id)
  batch.update(productRef, {
    ...product,
    imageUrl: url
  })
  const affectedPacks = packs.filter(p => p.productId === product.id)
  affectedPacks.forEach(p => {
    const packRef = firebase.firestore().collection('packs').doc(p.id)
    batch.update(packRef, {
      productName: product.name,
      imageUrl: product.imageUrl,
      categoryId: product.categoryId,
      country: product.country,
      trademark: product.trademark,
      tagId: product.tagId,
      sales: product.sales,
      rating: product.rating,
      ratingCount: product.ratingCount
    })
  })
  return batch.commit()
}

export const editPrice = (storePack, oldPrice, pack, storePacks, packs) => {
  const batch = firebase.firestore().batch()
  const storePackRef = firebase.firestore().collection('store-packs').doc(storePack.id)
  batch.update(storePackRef, storePack)
  const storeRef = firebase.firestore().collection('stores').doc(storePack.storeId)
  batch.update(storeRef, {
    lastUpdate: new Date()
  })
  let newPack = pack
  if (storePack.cost !== storePack.price && storePack.storeId !== 's' && pack.subPackId) { //from type 5
    newPack = packs.find(p => p.id === pack.subPackId)
  } 
  if (storePack.price < newPack.price || newPack.price === 0 || newPack.price === oldPrice) {
    const { minPrice, minStoreId, weightedPrice, offerEnd } = getMinPrice(storePack, newPack, storePacks, packs, false)
    const packRef = firebase.firestore().collection('packs').doc(newPack.id)
    batch.update(packRef, {
      price: minPrice,
      weightedPrice,
      offerEnd,
      minStoreId
    })
  }
  return batch.commit()
}

export const haltOffer = (storePack, storePacks, packs) => {
  const batch = firebase.firestore().batch()
  const storePackRef = firebase.firestore().collection('store-packs').doc(storePack.id)
  batch.update(storePackRef, {
    price: 0
  })
  const storeRef = firebase.firestore().collection('stores').doc(storePack.storeId)
  batch.update(storeRef, {
    lastUpdate: new Date()
  })
  const pack = packs.find(p => p.id === storePack.packId)
  if (storePack.price === pack.price) {
    const { minPrice, minStoreId, weightedPrice, offerEnd } = getMinPrice(storePack, pack, storePacks, packs, true)
    const packRef = firebase.firestore().collection('packs').doc(storePack.packId)
    batch.update(packRef, {
      price: minPrice,
      weightedPrice,
      offerEnd,
      minStoreId
    })
  }
  return batch.commit()
}

const getMinPrice = (storePack, pack, storePacks, packs, isDeletion) => {
  let packStores = storePacks.filter(p => (p.packId === pack.id || (p.cost !== p.price && packs.find(pa => pa.id === p.packId && pa.subPackId === pack.id))) && p.price > 0)
  packStores = packStores.filter(s => s.storeId !== storePack.storeId)
  if (!isDeletion){
    packStores.push(storePack)
  }
  const stock = packStores.find(s => s.storeId === 's')
  if (stock && stock.quantity > 0) {
    packStores = packStores.filter(s => s.cost === s.price || s.storeId === 's') //omit type 5
  }
  const prices = packStores.map(s => s.price)
  let minPrice = Math.min(...prices)
  minPrice = minPrice === Infinity ? 0 : minPrice
  const weightedPrice = pack.unitsCount ? parseInt(minPrice / pack.unitsCount) : 0
  packStores.sort((p1, p2) => (p2.offerEnd ? p2.offerEnd.toDate() : moment().add(1000, 'days')) - (p1.offerEnd ? p1.offerEnd.toDate() : moment().add(1000, 'days')))
  const offerEnd = packStores.find(s => s.price === minPrice).offerEnd || ''
  let minStoreId = ''
  if (packStores.filter(s => s.price === minPrice).length === 1) {
    minStoreId = packStores.find(s => s.price === minPrice).storeId
  }
  return {minPrice, minStoreId, weightedPrice, offerEnd}
}

export const refreshPackPrice = (pack, storePacks, packs) => {
  let packStores = storePacks.filter(p => (p.packId === pack.id || (p.cost !== p.price && packs.find(pa => pa.id === p.packId && pa.subPackId === pack.id))) && p.price > 0)
  const stock = packStores.find(s => s.storeId === 's')
  if (stock && stock.quantity > 0) {
    packStores = packStores.filter(s => s.cost === s.price || s.storeId === 's') //omit type 5
  }
  const prices = packStores.map(s => s.price)
  let minPrice = Math.min(...prices)
  minPrice = minPrice === Infinity ? 0 : minPrice
  const weightedPrice = pack.unitsCount ? parseInt(minPrice / pack.unitsCount) : 0
  packStores.sort((p1, p2) => (p2.offerEnd ? p2.offerEnd.toDate() : moment().add(1000, 'days')) - (p1.offerEnd ? p1.offerEnd.toDate() : moment().add(1000, 'days')))
  const offerEnd = packStores.find(s => s.price === minPrice).offerEnd || ''
  let minStoreId = ''
  if (packStores.filter(s => s.price === minPrice).length === 1) {
    minStoreId = packStores.find(s => s.price === minPrice).storeId
  }
  return firebase.firestore().collection('packs').doc(pack.id).update({
    price: minPrice,
    weightedPrice,
    offerEnd,
    minStoreId
  })
}

export const deleteStorePack = (storePack, storePacks, packs) => {
  const batch = firebase.firestore().batch()
  const storePackRef = firebase.firestore().collection('store-packs').doc(storePack.id)
  batch.delete(storePackRef)
  const storeRef = firebase.firestore().collection('stores').doc(storePack.storeId)
  batch.update(storeRef, {
    lastUpdate: new Date()
  })
  const pack = packs.find(p => p.id === storePack.packId)
  let newPack = pack
  if (storePack.cost !== storePack.price && storePack.storeId !== 's' && pack.subPackId) { //from type 5
    newPack = packs.find(p => p.id === pack.subPackId)
  } 
  if (storePack.price === newPack.price) {
    const { minPrice, minStoreId, weightedPrice, offerEnd } = getMinPrice(storePack, newPack, storePacks, packs, true)
    const packRef = firebase.firestore().collection('packs').doc(newPack.id)
    batch.update(packRef, {
      price: minPrice,
      weightedPrice,
      offerEnd,
      minStoreId
    })
  }
  return batch.commit()
}

export const addStore = store => {
  return firebase.firestore().collection('stores').add(store)
}

export const editStore = store => {
  return firebase.firestore().collection('stores').doc(store.id).update(store)
}

export const addStock = () => {
  return firebase.firestore().collection('stores').doc('s').set({
    name: labels.stockName,
    type: '1'
  })
}

export const addSpending = spending => {
  return firebase.firestore().collection('spendings').add(spending)
}

export const editSpending = spending => {
  return firebase.firestore().collection('spendings').doc(spending.id).update(spending)
}

export const addCountry = country => {
  return firebase.firestore().collection('countries').add(country)
}

export const editCountry = (id, name, oldName, products, packs) => {
  const batch = firebase.firestore().batch()
  const countryRef = firebase.firestore().collection('countries').doc(id)
  batch.update(countryRef, {
    name
  })
  const affectedProducts = products.filter(p => p.country === oldName)
  affectedProducts.forEach(p => {
    const productRef = firebase.firestore().collection('products').doc(p.id)
    batch.update(productRef, {
      country: name
    })
    const affectedPacks = packs.filter(p => p.productId === p.id)
    affectedPacks.forEach(pa => {
      const packRef = firebase.firestore().collection('packs').doc(pa.id)
      batch.update(packRef, {
        country: name
      })
    })
  })
  return batch.commit()
}

export const addLocation = location => {
  return firebase.firestore().collection('locations').add(location)
}

export const editLocation = location => {
  return firebase.firestore().collection('locations').doc(location.id).update(location)
}

export const addCategory = (parentId, name, ordering) => {
  const batch = firebase.firestore().batch()
  let categoryRef
  if (parentId === '0') {
    categoryRef = firebase.firestore().collection('categories').doc()
    batch.set(categoryRef, {
      parentId,
      name,
      ordering,
      isLeaf: true
    })
  } else {
    categoryRef = firebase.firestore().collection('categories').doc(parentId)
    batch.update(categoryRef, {
      isLeaf: false
    })
    categoryRef = firebase.firestore().collection('categories').doc()
    batch.set(categoryRef, {
      parentId,
      name,
      ordering,
      isLeaf: true
    })
  }
  return batch.commit()
}

export const editCategory = category => {
  return firebase.firestore().collection('categories').doc(category.id).update(category)
}

export const getCategoryName = (category, categories) => {
  if (category.parentId === '0') {
    return category.name
  } else {
    const categoryParent = categories.find(c => c.id === category.parentId)
    return getCategoryName(categoryParent, categories) + '-' + category.name
  }
}

export const addTrademark = trademark => {
  return firebase.firestore().collection('trademarks').add(trademark)
}

export const editTrademark = (id, name, oldName, products, packs) => {
  const batch = firebase.firestore().batch()
  const trademarkRef = firebase.firestore().collection('trademarks').doc(id)
  batch.update(trademarkRef, {
    name
  })
  const affectedProducts = products.filter(p => p.trademark === oldName)
  affectedProducts.forEach(p => {
    const productRef = firebase.firestore().collection('products').doc(p.id)
    batch.update(productRef, {
      trademark: name
    })
    const affectedPacks = packs.filter(p => p.productId === p.id)
    affectedPacks.forEach(pa => {
      const packRef = firebase.firestore().collection('packs').doc(pa.id)
      batch.update(packRef, {
        trademark: name
      })
    })

  })
  return batch.commit()
}

export const resolvePasswordRequest = requestId => {
  return firebase.firestore().collection('password-requests').doc(requestId).update({
    status: 'r'
  })
}

export const addPack = pack => {
  return firebase.firestore().collection('packs').add(pack)
}

export const editPack = pack => {
  return firebase.firestore().collection('packs').doc(pack.id).update(pack)
}

export const addTag = tag => {
  return firebase.firestore().collection('tags').add(tag)
}

export const editTag = tag => {
  return firebase.firestore().collection('tags').doc(tag.id).update(tag)
}

export const editCustomer = customer => {
  return firebase.firestore().collection('customers').doc(customer.id).update(customer)
}

export const approveUser = user => {
  const batch = firebase.firestore().batch()
  const customerRef = firebase.firestore().collection('customers').doc(user.id)
  batch.set(customerRef, {
    name: user.name,
    fullName: `${user.name}${user.storeName ? '-' + user.storeName : ''}: ${user.mobile}`, 
    storeId: user.storeId,
    address: user.address,
    orderLimit: 0,
    deliveryDiscount: 0,
    withDelivery: false,
    deliveryInterval: '',
    locationId: user.locationId,
    discounts: 0,
    isOldAge: false,
    position: '',
    isBlocked: false,
    otherMobile: user.otherMobile,
    exceedPrice: false,
    ordersCount: 0,
    deliveredOrdersCount: 0,
    returnedCount: 0,
    deliveredOrdersTotal: 0,
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

export const approveAlarm = (alarm, pack, store, customer, storePacks, packs) => {
  const batch = firebase.firestore().batch()
  const storeId = customer.storeId || store
  const alarmRef = firebase.firestore().collection('alarms').doc(alarm.id)
  batch.update(alarmRef, {
    status: 'a',
    storeId
  })
  const storePack = storePacks.find(p => p.storeId === storeId && p.packId === alarm.packId)
  if (alarm.alarmType === '1'){
    const customerRef = firebase.firestore().collection('customers').doc(customer.id)
    batch.update(customerRef, {
      discounts: firebase.firestore.FieldValue.increment(setup.alarmDiscount)
    })
    sendNotification(batch, customer.id, labels.approveAlarmNotification)
  } else if (alarm.alarmType === '2') {
    const oldPrice = storePack.price
    const newStorePack = { 
      ...storePack,
      storeId,
      cost: alarm.price,
      price: alarm.price,
      userId: alarm.userId,
      offerEnd: alarm.offerEnd,
      time: new Date()
    }
    const storePackRef = firebase.firestore().collection('store-packs').doc(storePack.id)
    batch.update(storePackRef, newStorePack)
    const storeRef = firebase.firestore().collection('stores').doc(storePack.storeId)
    batch.update(storeRef, {
      lastUpdate: new Date()
    })
    if (newStorePack.price < pack.price || pack.price === 0 || pack.price === oldPrice) {
      const { minPrice, minStoreId, weightedPrice, offerEnd } = getMinPrice(newStorePack, pack, storePacks, packs, false)
      const packRef = firebase.firestore().collection('packs').doc(storePack.packId)
      batch.update(packRef, {
        price: minPrice,
        weightedPrice,
        offerEnd,
        minStoreId
      })
    }
    sendNotification(batch, customer.id, labels.approveOwenerChangePriceNotification)
  } else if (alarm.alarmType === '4') {
    const storePackRef = firebase.firestore().collection('store-packs').doc(storePack.id)
    batch.delete(storePackRef)
    const storeRef = firebase.firestore().collection('stores').doc(storePack.storeId)
    batch.update(storeRef, {
      lastUpdate: new Date()
    })
    if (storePack.price === pack.price) {
      const { minPrice, minStoreId, weightedPrice, offerEnd } = getMinPrice(storePack, pack, storePacks, packs, true)
      const packRef = firebase.firestore().collection('packs').doc(storePack.packId)
      batch.update(packRef, {
        price: minPrice,
        weightedPrice,
        offerEnd,
        minStoreId
      })
    }
    sendNotification(batch, customer.id, labels.approveOwenerDeletemNotification)
  }
  return batch.commit()
}

export const rejectAlarm = alarm => {
  return firebase.firestore().collection('alarms').doc(alarm.id).update({
    status: 'r'
  })
}

export const packUnavailable = (pack, packPrice, orders, overPriced) => {
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
        status: orderPack.purchased > 0 ? 'pu' : 'u',
        gross: parseInt((orderPack.actual || 0) * (orderPack.weight || orderPack.purchased)),
        overPriced
      }
    ]
    if (basket.length === basket.filter(p => p.status === 'u').length) {
      orderStatus = 'u'
    } else if (basket.length === basket.filter(p => ['f', 'u', 'pu'].includes(p.status)).length) {
      orderStatus = 'f'
    }
    const total = basket.reduce((sum, p) => sum + (p.gross || 0), 0)
    let fixedFees, fraction, profit
    let discount = o.discount
    if (total === 0) {
      fixedFees = 0
      fraction = 0
      profit = 0
      discount = 0
    } else {
      profit = basket.reduce((sum, p) => sum + ['p', 'f', 'pu'].includes(p.status) ? parseInt((p.actual - p.cost) * (p.weight || p.purchased)) : 0, 0)
      fraction = total - Math.floor(total / 50) * 50
      fixedFees = Math.ceil((o.urgent ? 1.5 : 1) * setup.fixedFees * total / 50) * 50 - fraction
    }
    const lastUpdate = orderStatus === o.status ? (o.lastUpdate || o.time) : new Date()
    const orderRef = firebase.firestore().collection('orders').doc(o.id)
    batch.update(orderRef, {
      basket,
      profit,
      total,
      fixedFees,
      discount,
      status: orderStatus,
      lastUpdate
    })
  })
  return batch.commit()
}

export const addMonthlyTrans = (trans, orders) => {
  const batch = firebase.firestore().batch()
  const transRef = firebase.firestore().collection('monthly-trans').doc(trans.id)
  batch.set(transRef, trans)
  const month = (Number(trans.id) % 100) - 1
  const year = parseInt(Number(trans.id) / 100)
  const ordersToArchived = orders.filter(o => ['s', 'r', 'd', 'c', 'u', 'i'].includes(o.status) && (o.time.toDate()).getFullYear() === year && (o.time.toDate()).getMonth() === month)
  ordersToArchived.forEach(o => {
    const orderRef = firebase.firestore().collection('orders').doc(o.id)
    batch.update(orderRef, {
      isArchived: true
    })
  })
  return batch.commit()
}

export const editOrder = (order, basket, storePacks, packs, locations, customers, batch) => {
  const newBatch = batch || firebase.firestore().batch()
  let returnBasket = basket.filter(p => p.quantity < p.purchased)
  if (returnBasket.length > 0){
    returnBasket = returnBasket.map(p => {
      return {
        ...p,
        quantity: addQuantity(p.purchased, p.quantity)
      }
    })
    stockIn(newBatch, 'i', returnBasket, storePacks, packs)
  }
  let packBasket = basket.filter(p => p.quantity > 0)
  packBasket = packBasket.map(p => {
    const status = p.quantity === p.purchased ? 'f' : p.purchased > 0 ? 'p' : 'n'
    return {
      ...p,
      purchased: Math.min(p.quantity, p.purchased),
      status,
      gross: status === 'f' ? parseInt(p.actual * (p.weight || p.purchased)) : parseInt((p.actual || 0) * (p.weight || p.purchased)) + parseInt(p.price * addQuantity(p.quantity, -1 * p.purchased)),
    }
  })
  let profit = packBasket.reduce((sum, p) => sum + ['p', 'f', 'pu'].includes(p.status) ? parseInt((p.actual - p.cost) * (p.weight || p.purchased)) : 0, 0)
  const total = packBasket.reduce((sum, p) => sum + (p.gross || 0), 0)
  const fraction = total - Math.floor(total / 50) * 50
  const fixedFees = Math.ceil((order.urgent ? 1.5 : 1) * setup.fixedFees * total / 50) * 50 - fraction
  const customer = customers.find(c => c.id === order.userId)
  const customerLocation = customer.locationId ? locations.find(l => l.id === customer.locationId) : ''
  const deliveryFees = order.withDelivery ? (customerLocation?.deliveryFees || setup.deliveryFees) * (order.urgent ? 1.5 : 1) - (customer.deliveryDiscount || 0) : 0
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
  } else if (packBasket.filter(p => p.purchased > 0).length > 0) {
    orderStatus = 'e'
  }
  const lastUpdate = orderStatus === order.status ? (order.lastUpdate || order.time) : new Date()
  newBatch.update(orderRef, {
    ...order,
    basket: packBasket,
    total,
    profit,
    fixedFees,
    deliveryFees,
    deliveryDiscount: order.withDelivery ? customer.deliveryDiscount : 0,
    status: orderStatus,
    lastUpdate
  })
  if (!batch) {
    return newBatch.commit()
  }
}

export const changePassword = async (oldPassword, newPassword) => {
  let user = firebase.auth().currentUser
  const email = user.email
  await firebase.auth().signInWithEmailAndPassword(email, oldPassword)
  user = firebase.auth().currentUser
  return user.updatePassword(newPassword)
}

export const approveRating = (rating, products, packs) => {
  const batch = firebase.firestore().batch()
  const ratingRef = firebase.firestore().collection('ratings').doc(rating.id)
  batch.update(ratingRef, {
    status: 'a'
  })
  const product = products.find(p => p.id === rating.productId)
  const oldRating = product.rating
  const ratingCount = product.ratingCount
  const newRating = ((oldRating * ratingCount) + (rating.value * 5)) / (ratingCount + 1)
  const productRef = firebase.firestore().collection('products').doc(rating.productId)
  batch.update(productRef, {
    rating: Math.round(newRating * 2) / 2,
    ratingCount: ratingCount + 1
  })
  const affectedPacks = packs.filter(p => p.productId === rating.productId)
  affectedPacks.forEach(p => {
    const packRef = firebase.firestore().collection('packs').doc(p.id)
    batch.update(packRef, {
      rating: Math.round(newRating * 2) / 2,
      ratingCount: ratingCount + 1
    })
  })
  const customerRef = firebase.firestore().collection('customers').doc(rating.userId)
  batch.update(customerRef, {
    discounts: firebase.firestore.FieldValue.increment(setup.ratingDiscount)
  })
  return batch.commit()
}

export const sendOrder = (order, position) => {
  if (position === 's' && order.status === 'd' && !order.basket.find(p => p.returned > 0)){
    return firebase.firestore().collection('orders').doc(order.id).update({
      position: firebase.firestore.FieldValue.delete()
    })  
  }
  return firebase.firestore().collection('orders').doc(order.id).update({
    position
  })
}

export const returnOrderPacks = (order, pack, returned) => {
  const batch = firebase.firestore().batch()
  const orderPack = order.basket.find(p => p.packId === pack.id)
  const otherPacks = order.basket.filter(p => p.packId !== pack.id)
  let status, gross
  if (returned === 0 && orderPack.returned > 0) {
    if (pack.isDivided) {
      status = parseInt(Math.abs(addQuantity(orderPack.quantity, -1 * orderPack.purchased)) / orderPack.quantity * 100) <= setup.weightErrorMargin ? 'f' : 'pu'
    } else {
      status = orderPack.quantity === orderPack.purchased ? 'f' : 'pu'
    }
    gross = parseInt(orderPack.actual * (orderPack.weight || orderPack.purchased))
  } else {
    if (returned === orderPack.purchased) {
      status = 'r'
      gross = 0
    } else {
      status = 'pr'
      gross = parseInt(orderPack.actual * addQuantity(orderPack.weight || orderPack.purchased, -1 * returned))
    }
  }
  const basket = [
    ...otherPacks, 
    {
      ...orderPack, 
      status,
      gross,
      returned: pack.isDivided || !pack.byWeight ? returned : orderPack.purchased,
    }
  ]
  let profit = basket.reduce((sum, p) => sum + ['p', 'f', 'pu', 'pr'].includes(p.status) ? parseInt((p.actual - p.cost) * addQuantity(p.weight || p.purchased, -1 * (p.returned || 0))) : 0, 0)
  const total = basket.reduce((sum, p) => sum + (p.gross || 0), 0)
  const fraction = total - Math.floor(total / 50) * 50
  const fixedFees = Math.ceil((order.urgent ? 1.5 : 1) * setup.fixedFees * total / 50) * 50 - fraction
  const orderRef = firebase.firestore().collection('orders').doc(order.id)
  batch.update(orderRef, {
    basket,
    total,
    profit,
    fixedFees
  })
  return batch.commit()
}

export const addStockTrans = (type, packId, quantity, cost, price, storePacks, packs, storeId) => {
  const batch = firebase.firestore().batch()
  const transRef = firebase.firestore().collection('stock-trans').doc()
  const packBasket = {
    packId,
    price,
    quantity,
    cost
  }
  const total = parseInt(price * quantity)
  batch.set(transRef, {
    basket: [packBasket],
    storeId: storeId || '',
    type,
    total,
    time: new Date()
  })
  packStockOut(batch, packBasket, storePacks, packs)
  return batch.commit()
}

export const allocateOrderPack = (order, pack) => {
  const batch = firebase.firestore().batch()
  let basket = order.basket
  const orderPackIndex = basket.findIndex(p => p.packId === pack.id)
  basket.splice(orderPackIndex, 1, {
    ...basket[orderPackIndex],
    isAllocated: true
  })
  const isFinished = basket.filter(p => p.purchased > 0).length === basket.filter(p => p.purchased > 0 && p.isAllocated).length
  const orderRef = firebase.firestore().collection('orders').doc(order.id)
  batch.update(orderRef, {
    basket,
    status: isFinished ? 'p' : order.status,
    position: isFinished ? 's' : '',
    lastUpdate: isFinished ? new Date() : order.lastUpdate
  })
  sendNotification(batch, order.userId, order.withDelivery ? labels.prepareOrderWithDeliveryNotification : labels.prepareOrderNotification)
  return batch.commit()
}

export const approveInvitation = invitation => {
  const batch = firebase.firestore().batch()
  const invitationRef = firebase.firestore().collection('invitations').doc(invitation.id)
  batch.update(invitationRef, invitation)
  sendNotification(batch, invitation.userId, labels.approveInvitationNotification)
}

export const addNotification = notification => {
  return firebase.firestore().collection('notifications').add(notification)
}

export const deleteNotification = notification => {
  return firebase.firestore().collection('notifications').doc(notification.id).delete()
}

const sendNotification = (batch, toCustomerId, message) => {
  const notificationRef = firebase.firestore().collection('notifications').doc()
  batch.set(notificationRef, {
    toCustomerId,
    message,
    status: 'n',
    time: new Date()
  })
}

export const getArchivedOrders = async () => {
  let orders = []
  await firebase.firestore().collection('orders').where('isArchived', '==', true).get().then(docs => {
    docs.forEach(doc => {
      orders.push({...doc.data(), id:doc.id})
    })
  })
  return orders
}

export const addCall = call => {
  return firebase.firestore().collection('calls').add(call)
}

const deleteCalls = (batch, order, calls) => {
  const customerCalls = calls.filter(c => c.userId === order.userId)
  customerCalls.forEach(c => {
    const callRef = firebase.firestore().collection('calls').doc(c.id)
    batch.delete(callRef)
  })
}

export const getRequestedPacks = (orders, basket, customers, packs) => {
  let packsArray = []
  orders.forEach(o => {
    const customerInfo = customers.find(c => c.id === o.userId)
    o.basket.forEach(p => {
      let exceedPriceQuantity = 0
      if (p.status === 'n' || p.status === 'p') {
        const packInfo = packs.find(pa => pa.id === p.packId)
        const found = packsArray.find(pa => pa.packId === p.packId && pa.price === p.price)
        if (p.price < packInfo.price && parseInt(p.price * (1 + setup.exceedPricePercent)) >= packInfo.price && customerInfo.exceedPrice) {
          exceedPriceQuantity = p.quantity - p.purchased
        }
        if (!packInfo.byWeight && found) {
          packsArray = packsArray.filter(pa => pa.packId !== found.packId)
          packsArray.push({
            ...found, 
            quantity: found.quantity + p.quantity - p.purchased,
            exceedPriceQuantity: found.exceedPriceQuantity + exceedPriceQuantity
          })
        } else {
          packsArray.push({
            packId: p.packId,
            price: p.price, 
            quantity: p.quantity - p.purchased,
            exceedPriceQuantity,
            byWeight: packInfo.byWeight,
            orderId: o.id
          })
        }
      }
    })
  })
  packsArray = packsArray.map(p => {
    const packInfo = packs.find(pa => pa.id === p.packId)
    let inBasket, offerInfo
    let inBasketQuantity = 0
    if (basket.packs) {
      if (p.byWeight) {
        inBasket = basket.packs.find(pa => pa.packId === p.packId && pa.orderId === p.orderId)
        inBasketQuantity = inBasket?.quantity || 0
      } else {
        inBasket = basket.packs.find(pa => pa.packId === p.packId && pa.price === p.price)
        if (inBasket) {
          inBasketQuantity = inBasket.quantity
        } else {
          inBasket = basket.packs.find(bp => packs.find(pa => pa.id === bp.packId && (pa.subPackId === p.packId || pa.bonusPackId === p.packId)) && bp.price === p.price)
          if (inBasket) {
            offerInfo = packs.find(pa => pa.id === inBasket.packId && pa.subPackId === p.packId)
            if (offerInfo) {
              inBasketQuantity = inBasket.quantity * offerInfo.subQuantity
            } else {
              offerInfo = packs.find(pa => p.aid === inBasket.packId && pa.bonusPackId === p.packId)
              if (offerInfo) {
                inBasketQuantity = inBasket.quantity * offerInfo.bonusQuantity
              }
            }
          }
        }
      }	
    }
    if (inBasketQuantity > 0) {
      if (parseInt(Math.abs(addQuantity(p.quantity, -1 * inBasketQuantity)) / p.quantity * 100) > setup.weightErrorMargin) {
        return {
          ...p,
          packInfo,
          quantity: addQuantity(p.quantity, -1 * inBasketQuantity),
          exceedPriceQuantity: addQuantity(p.exceedPriceQuantity, -1 * inBasketQuantity),
        }
      } else {
        return {
          ...p,
          packInfo,
          quantity: 0
        }
      }
    } else {
      return {
        ...p,
        packInfo
      }
    }
  })
  packsArray = packsArray.filter(p => p.quantity > 0)
  return packsArray.sort((p1, p2) => p1.packId > p2.packId ? 1 : -1)
}

export const getRequestedPackStores = (pack, basketStockQuantity, storePacks, stores, packs, leastPrice) => {
  let packStores = storePacks.filter(p => (p.packId === pack.id || packs.find(pa => pa.id === p.packId && (pa.subPackId === pack.id || pa.bonusPackId === pack.id))) && (p.storeId !== 's' || addQuantity(p.quantity, -1 * basketStockQuantity) > 0))
  packStores = packStores.map(s => {
    let packId, unitPrice, quantity, offerInfo, isOffer, price
    if (s.packId === pack.id) {
      packId = s.packId
      if (s.cost === s.price || s.storeId === 's') { // for type 5 get total price not unit price
        price = s.price
        unitPrice = s.price
      } else {
        price = s.cost
        unitPrice = s.price
      }
      quantity = s.quantity
      isOffer = false
    } else {
      offerInfo = packs.find(p => p.id === s.packId && p.subPackId === pack.id)
      if (offerInfo) {
        packId = offerInfo.id
        if (s.cost === s.price || s.storeId === 's') { // for type 5 get total price not unit price
          unitPrice = parseInt((s.price / offerInfo.subQuantity) * offerInfo.subPercent)
          price = s.price
          isOffer = true
        } else {
          unitPrice = s.price
          price = s.cost
          isOffer = false
        }
        quantity = offerInfo.subQuantity
      } else {
        offerInfo = packs.find(p => p.id === s.packId && p.bonusPackId === pack.id)
        if (offerInfo) {
          packId = offerInfo.id
          price = s.price
          unitPrice = parseInt((s.price / offerInfo.bonusQuantity) * offerInfo.bonusPercent)
          quantity = offerInfo.bonusQuantity
          isOffer = true
        }
      }
    }
    const storeInfo = stores.find(st => st.id === s.storeId)
    const packInfo = packs.find(p => p.id === s.packId)
    return {
      ...s,
      packId,
      price,
      quantity,
      unitPrice,
      isOffer,
      storeInfo,
      packInfo
    }
  })
  return packStores.filter(s => s.packId && (leastPrice ? s.unitPrice <= leastPrice : true))
}

export const addAdvert = async (advert, image) => {
  const advertRef = await firebase.firestore().collection('adverts').add(advert)
  const filename = image.name
  const ext = filename.slice(filename.lastIndexOf('.'))
  const fileData = await firebase.storage().ref().child('adverts/' + advertRef.id + ext).put(image)
  const url = await firebase.storage().ref().child(fileData.metadata.fullPath).getDownloadURL()
  return firebase.firestore().collection('adverts').doc(advertRef.id).update({imageUrl: url})
}

export const updateAdvertStatus = (advert, isActive, adverts) => {
  const batch = firebase.firestore().batch()
  let advertRef = firebase.firestore().collection('adverts').doc(advert.id)
  batch.update(advertRef, {
    isActive
  })
  if (isActive) {
    const activeAdvert = adverts.find(a => a.isActive)
    if (activeAdvert) {
      advertRef = firebase.firestore().collection('adverts').doc(activeAdvert.id)
      batch.update(advertRef, {
        isActive: false
      })
    }
  }
  return batch.commit()
}

export const deleteAdvert = advert => {
  return firebase.firestore().collection('adverts').doc(advert.id).delete()
}

export const editAdvert = async (advert, image) => {
  let url
  if (image) {
    const filename = image.name
    const ext = filename.slice(filename.lastIndexOf('.'))
    const fileData = await firebase.storage().ref().child('adverts/' + advert.id + ext).put(image)
    url = await firebase.storage().ref().child(fileData.metadata.fullPath).getDownloadURL()
  } else {
    url = advert.imageUrl
  }
  return firebase.firestore().collection('adverts').doc(advert.id).update({
    ...advert,
    imageUrl: url
  })
}

export const mergeOrder = (order, lastOrder, batch) => {
  const newBatch = batch ? batch : firebase.firestore().batch()
  let basket = lastOrder.basket
  order.basket.forEach(p => {
    let newItem
    let found = lastOrder.basket.find(bp => bp.packId === p.packId)
    if (found === -1) {
      newItem = p
    } else {
      const status = p.status === 'f' ? 'p' : p.status
      const newQuantity = addQuantity(basket[found].quantity, p.quantity)
      newItem = {
        ...basket[found],
        quantity: newQuantity,
        status,
        gross: status === 'f' ? parseInt(p.actual * (p.weight || p.purchased)) : parseInt((p.actual || 0) * (p.weight || p.purchased)) + parseInt(p.price * addQuantity(newQuantity, -1 * p.purchased)),
      }  
    }
    basket.splice(found === -1 ? basket.length : found, found === -1 ? 0 : 1, newItem)
  })
  const total = basket.reduce((sum, p) => sum + (p.gross || 0), 0)
  const fraction = total - Math.floor(total / 50) * 50
  const fixedFees = Math.ceil((order.urgent ? 1.5 : 1) * setup.fixedFees * total / 50) * 50 - fraction
  let orderRef = firebase.firestore().collection('orders').doc(lastOrder.id)
  newBatch.update(orderRef, {
    basket,
    total,
    fixedFees,
    activeTime: new Date()
  })
  orderRef = firebase.firestore().collection('orders').doc(order.id)
  newBatch.update(orderRef, {
    status: 'm',
    lastUpdate: new Date()
  })
  if (!batch) {
    return newBatch.commit()
  }
} 

export const approveOrderRequest = (orderRequest, orders, storePacks, packs, calls, users, invitations, locations, customers) => {
  const batch = firebase.firestore().batch()
  const requestRef = firebase.firestore().collection('order-requests').doc(orderRequest.id)
  if (orderRequest.type === 'm') {
    const userOrders = orders.filter(o => o.id !== orderRequest.order.id && o.userId === orderRequest.order.userId)
    userOrders.sort((o1, o2) => o2.time.seconds - o1.time.seconds)
    const lastOrder = ['a', 'e'].includes(userOrders[0]?.status) ? userOrders[0] : ''    
    mergeOrder(orderRequest.order, lastOrder, batch)
    sendNotification(batch, orderRequest.order.userId, labels.approveMergeRequestNotification)
  } else if (orderRequest.type === 'c') {
    updateOrderStatus (orderRequest.order, 'i', storePacks, packs, calls, users, invitations, false, batch)
    sendNotification(batch, orderRequest.order.userId, labels.approveCancelRequestNotification)
  } else {
    editOrder (orderRequest.order, orderRequest.basket, storePacks, packs, locations, customers, batch)
    sendNotification(batch, orderRequest.order.userId, labels.approveEditRequestNotification)
  }
  batch.update(requestRef, {
    status: 'a'
  })
  return batch.commit()
}

export const returnPurchasePack = (purchase, pack, orders, stockTrans, storePacks, packs) => {
  const batch = firebase.firestore().batch()
  const purchaseRef = firebase.firestore().collection('purchases').doc(purchase.id)
  const purchasePackIndex = purchase.basket.findIndex(p => p.packId === pack.packId && p.quantity === pack.quantity)
  let purchaseBasket = purchase.basket
  purchaseBasket.splice(purchasePackIndex, 1)
  if (purchaseBasket.length === 0) {
    batch.delete(purchaseRef)
  } else {
    batch.update(purchaseRef, {
      basket: purchaseBasket
    })  
  }
  const affectedOrders = orders.filter(o => o.basket.find(p => p.lastPurchaseId === purchase.id))
  affectedOrders.forEach(o => {
    const orderBasket = o.basket
    const orderPackIndex = orderBasket.findIndex(p => p.lastPurchaseId === purchase.id && p.packId === pack.packId)
    const affectedPack = orderBasket[orderPackIndex]
    let avgCost, avgActual, status, newPurchased, newWeight
    if (affectedPack.purchased === affectedPack.lastPurchased) {
      newPurchased = 0
      avgCost = 0
      avgActual = 0
      status = 'n'
    } else if (affectedPack.weight > 0) {
      newWeight = addQuantity(affectedPack.weight, -1 * pack.weight)
      avgCost = parseInt((affectedPack.cost * affectedPack.weight + pack.cost * pack.weight) / newWeight)
      avgActual = parseInt((affectedPack.actual * affectedPack.weight + pack.actual * pack.weight) / newWeight)
      newPurchased = addQuantity(affectedPack.purchased, -1 * affectedPack.lastPurchased)
      status = 'p'
    } else {
      newPurchased = addQuantity(affectedPack.purchased, -1 * affectedPack.lastPurchased)
      avgCost = parseInt((affectedPack.cost * affectedPack.purchased - pack.cost * affectedPack.lastPurchased) / newPurchased)
      avgActual = parseInt((affectedPack.actual * affectedPack.purchased - pack.actual * affectedPack.lastPurchased) / newPurchased)
      status = 'p'
    }
    const newPack = {
      ...affectedPack,
      purchased: newPurchased,
      storeId: affectedPack.prevStoreId,
      cost: avgCost,
      actual: avgActual,
      gross: parseInt(avgActual * (newWeight || newPurchased)) + parseInt(affectedPack.price * addQuantity(affectedPack.quantity, -1 * newPurchased)),
      status
    }
    if (newWeight) newPack['weight'] = newWeight
    orderBasket.splice(orderPackIndex, 1, newPack)
    const profit = orderBasket.reduce((sum, p) => sum + ['p', 'f', 'pu'].includes(p.status) ? parseInt((p.actual - p.cost) * (p.weight ? p.weight : p.purchased)) : 0, 0)
    const total = orderBasket.reduce((sum, p) => sum + (p.gross || 0), 0)
    const fraction = total - Math.floor(total / 50) * 50
    const fixedFees = Math.ceil((o.urgent ? 1.5 : 1) * setup.fixedFees * total / 50) * 50 - fraction  
    const orderRef = firebase.firestore().collection('orders').doc(o.id)
    batch.update(orderRef, {
      basket: orderBasket,
      profit,
      total,
      fixedFees,
      status: orderBasket.find(bp => bp.status === 'p') ? 'e' : 'a',
      lastUpdate: new Date()
    })
  })
  const affectedStockTrans = stockTrans.find(t => t.purchaseId === purchase.id)
  let transBasket, transPackIndex, transTotal
  if (affectedStockTrans) {
    transBasket = affectedStockTrans.basket
    transPackIndex = transBasket.findIndex(p => p.packId === pack.packId)
    packStockOut(batch, transBasket[transPackIndex], storePacks, packs)
    const storePackRef = firebase.firestore().collection('stock-trans').doc(affectedStockTrans.id)
    if (transBasket.length === 1) {
      batch.delete(storePackRef)
    } else {
      transBasket.splice(transPackIndex, 1)
      transTotal = transBasket.reduce((sum, p) => sum + parseInt(p.cost * p.quantity), 0)
      batch.update(storePackRef, {
        basket: transBasket,
        total: transTotal
      })
    }
  }
  return batch.commit()
}
