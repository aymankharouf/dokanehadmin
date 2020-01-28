import firebase from './firebase'
import labels from './labels'
import { f7 } from 'framework7-react'
import { setup, randomColors } from './config'
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
  return labels[errorCode] || labels['unknownError']
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
    orderStatus = 'd'
  }
  const profit = basket.reduce((sum, p) => sum + ['p', 'f', 'pu'].includes(p.status) ? ((p.actual - p.cost) * (p.weight || p.purchased)) : 0, 0)
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
        lastPurchaseId: purchaseId || '',
        lastPurchased: purchased,
        prevStoreId: orderPack.storeId || ''
      }
    ]
    if (basket.length === basket.filter(p => ['f', 'u', 'pu'].includes(p.status)).length) {
      orderStatus = 'd'
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

export const finishOrder = (order, storePacks, packs, users) => {
  const batch = firebase.firestore().batch()
  let basket = order.basket.filter(p => p.returned > 0)
  basket = basket.map(p => {
    return {
      ...p,
      quantity: p.returned
    }
  })
  if (order.total === 0) {
    refreshOrderTotal(batch, order)
    updateOrderStatus(order, 'i', storePacks, packs, users, false, batch)
  } else {
    stockIn(batch, 'i', basket, storePacks, packs)
    updateOrderStatus(order, 'f', storePacks, packs, users, false, batch)
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
export const refreshOrderTotal = (batch, order) => {
  const basket = order.basket.map(p => {
    return {
      ...order,
      gross: parseInt(p.actual * (p.weight || p.purchased))
    }
  })
  const profit = basket.reduce((sum, p) => sum + ['p', 'f', 'pu', 'pr'].includes(p.status) ? parseInt((p.actual - p.cost) * addQuantity(p.weight || p.purchased, -1 * (p.returned || 0))) : 0, 0)
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
}

export const updateOrderStatus = (order, type, storePacks, packs, users, blockUserFlag, batch) => {
  const newBatch = batch || firebase.firestore().batch()
  const orderRef = firebase.firestore().collection('orders').doc(order.id)
  newBatch.update(orderRef, {
    status: type,
    position: firebase.firestore.FieldValue.delete(),
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
    sendNotification(newBatch, order.userId, labels.approval, labels.approveOrder, users)
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
      sendNotification(newBatch, order.userId, labels.notice, labels.customerHasBeenBlocked, users)
    }
  } else if (type === 'f'){
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
    const invitedBy = users.find(u => u.invitations.find(i => i.mobile === userInfo.mobile && i.status === 'a'))
    if (invitedBy) {
      customerRef = firebase.firestore().collection('customers').doc(invitedBy.id)
      newBatch.update(customerRef, {
        discounts: firebase.firestore.FieldValue.increment(setup.invitationDiscount)
      })
    }
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
    isArchived: false,
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
    isArchived: false,
    time: new Date()
  })
  let packOrders, remaining, packInfo, pack, quantity
  let packsIn = []
  const approvedOrders = orders.filter(o => ['a', 'e'].includes(o.status))
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
      packOrders = approvedOrders.filter(o => o.basket.find(op => op.packId === p.packId && op.price === p.price && ['n', 'p'].includes(op.status)))
      packOrders.sort((o1, o2) => o1.activeTime.seconds - o2.activeTime.seconds)
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
          packOrders = approvedOrders.filter(o => o.basket.find(op => op.packId === packInfo.subPackId && op.price === p.price && ['n', 'p'].includes(op.status)))
          packOrders.sort((o1, o2) => o1.activeTime.seconds - o2.activeTime.seconds)
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
            packOrders = approvedOrders.filter(o => o.basket.find(op => op.packId === packInfo.bonusPackId && op.price === p.price && ['n', 'p'].includes(op.status)))
            packOrders.sort((o1, o2) => o1.activeTime.seconds - o2.activeTime.seconds)
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
    isArchived: false,
    time: new Date()
  })
  const approvedOrders = orders.filter(o => ['a', 'e'].includes(o.status))
  basket.forEach(p => {
    const packInfo = packs.find(pa => pa.id === p.packId)
    if (p.orderId) {
      const order = orders.find(o => o.id === p.orderId)
      updateOrder(batch, 's', order, p, packInfo.price, customers)
    } else {
      let packOrders = approvedOrders.filter(o => o.basket.find(op => op.packId === p.packId && op.price === p.price))
      packOrders.sort((o1, o2) => o1.activeTime.seconds - o2.activeTime.seconds)
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

export const addStorePack = (storePack, pack, storePacks, packs, batch) => {
  const newBatch = batch || firebase.firestore().batch()
  const storePackRef = firebase.firestore().collection('store-packs').doc()
  newBatch.set(storePackRef, storePack)
  let newPack = pack
  if (storePack.cost !== storePack.price && storePack.storeId !== 's' && pack.subPackId) { //from type 5
    newPack = packs.find(p => p.id === pack.subPackId)
  } 
  if (storePack.price < newPack.price || newPack.price === 0) {
    const { minPrice, minStoreId, weightedPrice, offerEnd } = getMinPrice(storePack, newPack, storePacks, packs, false)
    const packRef = firebase.firestore().collection('packs').doc(newPack.id)
    newBatch.update(packRef, {
      price: minPrice,
      weightedPrice,
      offerEnd,
      minStoreId
    })
  }
  if (!batch) {
    return newBatch.commit()
  }
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

export const editPrice = (storePack, oldPrice, pack, storePacks, packs, batch) => {
  const newBatch = batch || firebase.firestore().batch()
  const storePackRef = firebase.firestore().collection('store-packs').doc(storePack.id)
  newBatch.update(storePackRef, storePack)
  let newPack = pack
  if (storePack.cost !== storePack.price && storePack.storeId !== 's' && pack.subPackId) { //from type 5
    newPack = packs.find(p => p.id === pack.subPackId)
  } 
  if (storePack.price < newPack.price || newPack.price === 0 || newPack.price === oldPrice) {
    const { minPrice, minStoreId, weightedPrice, offerEnd } = getMinPrice(storePack, newPack, storePacks, packs, false)
    const packRef = firebase.firestore().collection('packs').doc(newPack.id)
    newBatch.update(packRef, {
      price: minPrice,
      weightedPrice,
      offerEnd,
      minStoreId
    })
  }
  if (!batch) {
    return newBatch.commit()
  }
}

export const haltOffer = (storePack, storePacks, packs) => {
  const batch = firebase.firestore().batch()
  const storePackRef = firebase.firestore().collection('store-packs').doc(storePack.id)
  batch.update(storePackRef, {
    price: 0
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
  const offerEnd = packStores.find(s => s.price === minPrice)?.offerEnd || ''
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

export const deleteStorePack = (storePack, storePacks, packs, batch) => {
  const newBatch = batch || firebase.firestore().batch()
  const storePackRef = firebase.firestore().collection('store-packs').doc(storePack.id)
  newBatch.delete(storePackRef)
  const pack = packs.find(p => p.id === storePack.packId)
  let newPack = pack
  if (storePack.cost !== storePack.price && storePack.storeId !== 's' && pack.subPackId) { //from type 5
    newPack = packs.find(p => p.id === pack.subPackId)
  } 
  if (storePack.price === newPack.price) {
    const { minPrice, minStoreId, weightedPrice, offerEnd } = getMinPrice(storePack, newPack, storePacks, packs, true)
    const packRef = firebase.firestore().collection('packs').doc(newPack.id)
    newBatch.update(packRef, {
      price: minPrice,
      weightedPrice,
      offerEnd,
      minStoreId
    })
  }
  if (!batch) {
    return newBatch.commit()
  }
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
  return firebase.firestore().collection('password-requests').doc(requestId).delete()
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

export const editCustomer = (customer, mobile, storeId, stores) => {
  const batch = firebase.firestore().batch()
  const customerRef = firebase.firestore().collection('customers').doc(customer.id)
  const storeName = storeId ? `-${stores.find(s => s.id === storeId).name}`: ''
  batch.update(customerRef, {
    ...customer,
    fullName: `${customer.name}${storeName}:${mobile}`,
  })
  const userRef = firebase.firestore().collection('users').doc(customer.id)
  batch.update(userRef, {
    name: customer.name,
  })
  return batch.commit()
}

export const approveUser = (id, name, mobile, locationId, otherMobile, storeName, address) => {
  const batch = firebase.firestore().batch()
  const customerRef = firebase.firestore().collection('customers').doc(id)
  batch.set(customerRef, {
    name,
    fullName: `${name}:${mobile}`,
    locationId,
    orderLimit: 0,
    withDelivery: false,
    isBlocked: false,
    storeName,
    address,
    deliveryDiscount: 0,
    deliveryInterval: '',
    discounts: 0,
    isOldAge: false,
    mapPosition: '',
    otherMobile,
    exceedPrice: false,
    ordersCount: 0,
    deliveredOrdersCount: 0,
    returnedCount: 0,
    deliveredOrdersTotal: 0,
    time: new Date()
  })
  const userRef = firebase.firestore().collection('users').doc(id)
  batch.update(userRef, {
    name,
    storeName: firebase.firestore.FieldValue.delete()
  })
  return batch.commit()
}

export const approveAlarm = (user, alarm, pack, store, newPackId, customer, storePacks, packs, users) => {
  const batch = firebase.firestore().batch()
  const storeId = customer.storeId || store
  const alarms = user.alarms.slice()
  const alarmIndex = alarms.findIndex(a => a.id === alarm.id)
  alarms.splice(alarmIndex, 1, {
    ...user.alarms[alarmIndex],
    status: 'a',
    storeId,
    newPackId
  })
  const userRef = firebase.firestore().collection('users').doc(user.id)
  batch.update(userRef, {
    alarms
  })
  const storePack = storePacks.find(p => p.storeId === storeId && p.packId === (newPackId || alarm.packId))
  if (['1', '5'].includes(alarm.type)){
    const customerRef = firebase.firestore().collection('customers').doc(user.id)
    batch.update(customerRef, {
      discounts: firebase.firestore.FieldValue.increment(setup.alarmDiscount)
    })
    sendNotification(batch, user.id, labels.approval, labels.approveAlarm, users)
  }
  let offerEnd = ''
  if (alarm.offerDays) {
    offerEnd = alarm.time.toDate()
    offerEnd.setDate(offerEnd.getDate() + alarm.offerDays)
  }
  let type = alarm.type
  if (['1', '5'].includes(alarm.type)) {
    type = storePack ? '2' : '3'
  }
  if (type === '2') {
    const oldPrice = storePack.price
    const newStorePack = { 
      ...storePack,
      storeId,
      cost: alarm.price,
      price: alarm.price,
      userId: user.id,
      offerEnd,
      time: new Date()
    }
    editPrice(newStorePack, oldPrice, pack, storePacks, packs, batch)
    if (customer.storeId){
      sendNotification(batch, user.id, labels.approval, labels.approveOwnerChangePrice, users)
    }
  } else if (type === '4') {
    deleteStorePack(storePack, storePacks, packs, batch)
    sendNotification(batch, user.id, labels.approval, labels.approveOwnerDelete, users)
  } else {
    const storePack = {
      packId: type === '3' ? alarm.packid : newPackId, 
      storeId,
      cost: alarm.price,
      price: alarm.price,
      offerEnd,
      time: new Date()
    }
    addStorePack(storePack, pack, storePacks, packs, batch)
    if (customer.storeId){
      sendNotification(batch, user.id, labels.approval, labels.approveOwnerAddPack, users)
    }
  }
  return batch.commit()
}

export const rejectAlarm = (user, alarmId) => {
  const alarms = user.alarms.slice()
  const alarmIndex = alarms.findIndex(a => a.id === alarmId)
  alarms.splice(alarmIndex, 1, {
    ...user.alarms[alarmIndex],
    status: 'r'
  })
  return firebase.firestore().collection('users').doc(user.id).update({
    alarms
  })
}

export const packUnavailable = (pack, packPrice, orders, overPriced) => {
  const batch = firebase.firestore().batch()
  const packOrders = orders.filter(o => o.basket.find(p => p.packId === pack.id && p.price === packPrice && ['n', 'p'].includes(p.status)))
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
      orderStatus = 'd'
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

export const addMonthlyTrans = (trans, orders, purchases, stockTrans) => {
  const batch = firebase.firestore().batch()
  const transRef = firebase.firestore().collection('monthly-trans').doc(trans.id)
  batch.set(transRef, trans)
  const month = (Number(trans.id) % 100) - 1
  const year = parseInt(Number(trans.id) / 100)
  const ordersToArchived = orders.filter(o => ['s', 'r', 'f', 'c', 'm', 'u', 'i'].includes(o.status) && (o.activeTime.toDate()).getFullYear() === year && (o.activeTime.toDate()).getMonth() === month)
  ordersToArchived.forEach(o => {
    const orderRef = firebase.firestore().collection('orders').doc(o.id)
    batch.update(orderRef, {
      isArchived: true,
      archivedMonth: trans.id
    })
  })
  const purchasesToArchived = purchases.filter(p => (p.time.toDate()).getFullYear() === year && (p.time.toDate()).getMonth() === month)
  purchasesToArchived.forEach(p => {
    const purchaseRef = firebase.firestore().collection('purchases').doc(p.id)
    batch.update(purchaseRef, {
      isArchived: true,
      archivedMonth: trans.id
    })
  })
  const stockTransToArchived = stockTrans.filter(t => (t.time.toDate()).getFullYear() === year && (t.time.toDate()).getMonth() === month)
  stockTransToArchived.forEach(t => {
    const stockTransRef = firebase.firestore().collection('stock-trans').doc(t.id)
    batch.update(stockTransRef, {
      isArchived: true,
      archivedMonth: trans.id
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
  const profit = packBasket.reduce((sum, p) => sum + ['p', 'f', 'pu'].includes(p.status) ? parseInt((p.actual - p.cost) * (p.weight || p.purchased)) : 0, 0)
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
    orderStatus = 'd'
  } else if (packBasket.filter(p => p.purchased > 0).length > 0) {
    orderStatus = 'e'
  }
  const lastUpdate = orderStatus === order.status ? (order.lastUpdate || order.activeTime) : new Date()
  newBatch.update(orderRef, {
    ...order,
    basket: packBasket,
    total,
    profit,
    fixedFees,
    deliveryFees,
    deliveryDiscount: order.withDelivery ? customer.deliveryDiscount : 0,
    status: orderStatus,
    lastUpdate,
    activeTime: batch ? new Date() : order.activeTime
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

export const approveRating = (rating, packs) => {
  const batch = firebase.firestore().batch()
  const ratings = rating.userInfo.ratings.slice()
  const ratingIndex = rating.findIndex(r => r.productId === rating.productInfo.id)
  rating.splice(ratingIndex, 1, {
    productId: rating.productInfo.id,
    value: rating.value,
    status: 'a'
  })
  const userRef = firebase.firestore().collection('users').doc(rating.userInfo.id)
  batch.update(userRef, {
    ratings
  })
  const oldRating = rating.productInfo.rating
  const ratingCount = rating.productInfo.ratingCount
  const newRating = ((oldRating * ratingCount) + (rating.value * 5)) / (ratingCount + 1)
  const productRef = firebase.firestore().collection('products').doc(rating.productInfo.id)
  batch.update(productRef, {
    rating: Math.round(newRating * 2) / 2,
    ratingCount: ratingCount + 1
  })
  const affectedPacks = packs.filter(p => p.productId === rating.productInfo.id)
  affectedPacks.forEach(p => {
    const packRef = firebase.firestore().collection('packs').doc(p.id)
    batch.update(packRef, {
      rating: Math.round(newRating * 2) / 2,
      ratingCount: ratingCount + 1
    })
  })
  const customerRef = firebase.firestore().collection('customers').doc(rating.userInfo.id)
  batch.update(customerRef, {
    discounts: firebase.firestore.FieldValue.increment(setup.ratingDiscount)
  })
  return batch.commit()
}

export const sendOrder = (order, position) => {
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
  const profit = basket.reduce((sum, p) => sum + ['p', 'f', 'pu', 'pr'].includes(p.status) ? parseInt((p.actual - p.cost) * addQuantity(p.weight || p.purchased, -1 * (p.returned || 0))) : 0, 0)
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

export const addStockTrans = (type, packId, quantity, cost, price, storePacks, packs, storeId, stores) => {
  const batch = firebase.firestore().batch()
  const transRef = firebase.firestore().collection('stock-trans').doc()
  const packBasket = {
    packId,
    price,
    quantity,
    cost
  }
  let total = parseInt(price * quantity)
  const discount = type === 'r' ? total * (stores.find(s => s.id === storeId)?.discount || 0) : 0
  total -= discount
  const newTrans = {
    basket: [packBasket],
    storeId: storeId || '',
    type,
    total,
    isArchived: false,
    time: new Date()
  }
  batch.set(transRef, newTrans)
  packStockOut(batch, packBasket, storePacks, packs)
  return batch.commit()
}

export const allocateOrderPack = (order, pack, users, stores) => {
  const batch = firebase.firestore().batch()
  let basket = order.basket.slice()
  const orderPackIndex = basket.findIndex(p => p.packId === pack.id)
  basket.splice(orderPackIndex, 1, {
    ...basket[orderPackIndex],
    isAllocated: true,
    storeName: basket[orderPackIndex].storeId === 'm' ? labels.multipleStores : (stores.find(s => s.id === basket[orderPackIndex].storeId)?.name || '')
  })
  const isFinished = basket.filter(p => p.purchased > 0).length === basket.filter(p => p.purchased > 0 && p.isAllocated).length
  const orderRef = firebase.firestore().collection('orders').doc(order.id)
  batch.update(orderRef, {
    basket,
    status: isFinished ? 'p' : order.status,
    position: isFinished ? 's' : '',
    lastUpdate: isFinished ? new Date() : order.lastUpdate
  })
  sendNotification(batch, order.userId, labels.notice, order.withDelivery ? labels.prepareOrderWithDelivery : labels.prepareOrder, users)
  return batch.commit()
}

export const approveInvitation = (user, mobile, status, users) => {
  const batch = firebase.firestore().batch()
  const invitations = user.invitations.slice()
  const invitationIndex = invitations.findIndex(i => i.mobile === mobile)
  invitations.splice(invitationIndex, 1, {
    ...user.invitations[invitationIndex],
    status: status === '0' ? 'a' : 'r'
  })
  const userRef = firebase.firestore().collection('users').doc(user.id)
  batch.update(userRef, {
    invitations
  })
  if (status === '0') {
    sendNotification(batch, user.id, labels.approval, labels.approveInvitation, users)
  }
  return batch.commit()
}

export const addNotification = (user, title, message) => {
  const notifications = user.notifications?.slice() || []
  notifications.push({
    id: Math.random(),
    title,
    message,
    status: 'n',
    time: new Date()
  })
  return firebase.firestore().collection('users').doc(user.id).update({
    notifications
  })
}

export const deleteNotification = (user, notificationId) => {
  const notifications = user.notifications.slice()
  const notificationIndex = notifications.findIndex(n => n.id === notificationId)
  notifications.splice(notificationIndex, 1)
  return firebase.firestore().collection('users').doc(user.id).update({
    notifications
  })
}

const sendNotification = (batch, userId, title, message, users) => {
  const notifications = users.find(u => u.id === userId).notifications?.slice() || []
  notifications.push({
    id: Math.random(),
    title,
    message,
    status: 'n',
    time: new Date()
  })
  const userRef = firebase.firestore().collection('users').doc(userId)
  batch.update(userRef, {
    notifications
  })
}

export const getArchivedOrders = async month => {
  let orders = []
  await firebase.firestore().collection('orders')
          .where('isArchived', '==', true)
          .where('activeMonth', '==', month)
          .get().then(docs => {
    docs.forEach(doc => {
      orders.push({...doc.data(), id:doc.id})
    })
  })
  return orders
}

export const getArchivedPurchases = async month => {
  let purchases = []
  await firebase.firestore().collection('purchases')
          .where('isArchived', '==', true)
          .where('activeMonth', '==', month)
          .get().then(docs => {
    docs.forEach(doc => {
      purchases.push({...doc.data(), id:doc.id})
    })
  })
  return purchases
}

export const getArchivedStockTrans = async month => {
  let stockTrans = []
  await firebase.firestore().collection('stock-trans')
          .where('isArchived', '==', true)
          .where('activeMonth', '==', month)
          .get().then(docs => {
    docs.forEach(doc => {
      stockTrans.push({...doc.data(), id:doc.id})
    })
  })
  return stockTrans
}

export const addCall = (order, callType, callResult) => {
  const calls = order.calls?.slice() || []
  calls.push({
    callType,
    callResult,
    time: new Date()
  })
  return firebase.firestore().collection('orders').doc(order.id).update({
    calls
  })
}

export const getRequestedPacks = (orders, basket, customers, packs) => {
  let packsArray = []
  orders.forEach(o => {
    const customerInfo = customers.find(c => c.id === o.userId)
    o.basket.forEach(p => {
      let exceedPriceQuantity = 0
      if (['n', 'p'].includes(p.status)) {
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
  if (image) {
    const advertRef = await firebase.firestore().collection('adverts').add(advert)
    const filename = image.name
    const ext = filename.slice(filename.lastIndexOf('.'))
    const fileData = await firebase.storage().ref().child('adverts/' + advertRef.id + ext).put(image)
    const url = await firebase.storage().ref().child(fileData.metadata.fullPath).getDownloadURL()  
    return firebase.firestore().collection('adverts').doc(advertRef.id).update({imageUrl: url})
  } else {
    return firebase.firestore().collection('adverts').add(advert)
  }
}

export const updateAdvertStatus = (advert, adverts) => {
  const batch = firebase.firestore().batch()
  let advertRef = firebase.firestore().collection('adverts').doc(advert.id)
  batch.update(advertRef, {
    isActive: !advert.isActive
  })
  if (!advert.isActive) {
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

export const mergeOrder = (order, basket, mergedOrderId, batch) => {
  const newBatch =  batch || firebase.firestore().batch()
  order.basket.forEach(p => {
    let newItem
    let found = basket.findIndex(bp => bp.packId === p.packId)
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
  let orderRef = firebase.firestore().collection('orders').doc(order.id)
  newBatch.update(orderRef, {
    basket,
    total,
    fixedFees,
    activeTime: new Date()
  })
  orderRef = firebase.firestore().collection('orders').doc(mergedOrderId)
  newBatch.update(orderRef, {
    status: 'm',
    lastUpdate: new Date()
  })
  if (!batch) {
    return newBatch.commit()
  }
} 

export const approveOrderRequest = (order, orders, storePacks, packs, users, locations, customers) => {
  const batch = firebase.firestore().batch()
  const orderRef = firebase.firestore().collection('orders').doc(order.id)
  if (order.requestType === 'm') {
    const mergedOrder = orders.find(o => o.userId === order.userId && o.status === 's')
    mergeOrder(order, order.requestBasket, mergedOrder?.id || '', batch)
    sendNotification(batch, order.userId, labels.approval, labels.approveMergeRequest, users)
  } else if (order.requestType === 'c') {
    updateOrderStatus (order, 'i', storePacks, packs, users, false, batch)
    sendNotification(batch, order.userId, labels.approval, labels.approveCancelRequest, users)
  } else {
    editOrder (order, order.requestBasket, storePacks, packs, locations, customers, batch)
    sendNotification(batch, order.userId, labels.approval, labels.approveEditRequest, users)
  }
  batch.update(orderRef, {
    requestStatus: 'a'
  })
  return batch.commit()
}

export const returnPurchasePack = (purchase, pack, orders, stockTrans, storePacks, packs, stores) => {
  const batch = firebase.firestore().batch()
  const purchaseRef = firebase.firestore().collection('purchases').doc(purchase.id)
  const purchasePackIndex = purchase.basket.findIndex(p => p.packId === pack.packId && p.quantity === pack.quantity)
  const storeInfo = stores.find(s => s.id === purchase.storeId)
  const discount = Math.max(0, purchase.discount - parseInt(purchase.basket[purchasePackIndex].quantity * purchase.basket[purchasePackIndex].price * storeInfo.discount))
  let purchaseBasket = purchase.basket
  purchaseBasket.splice(purchasePackIndex, 1)
  if (purchaseBasket.length === 0) {
    batch.delete(purchaseRef)
  } else {
    batch.update(purchaseRef, {
      basket: purchaseBasket,
      discount
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

export const permitUser = async (userId, storeId, type, users, stores) => {
  const userInfo = users.find(u => u.id === userId)
  if (type) {
    await firebase.firestore().collection('customers').doc(userId).update({
      permissionType: type
    })  
  } else {
    await firebase.firestore().collection('customers').doc(userId).update({
      permissionType: firebase.firestore.FieldValue.delete()
    })  
  }
  let fullName
  if (storeId) {
    fullName = `${userInfo.name}-${stores.find(s => s.id === storeId).name}:${userInfo.mobile}`
    await firebase.firestore().collection('customers').doc(userId).update({
      storeId,
      fullName
    })  
  } else {
    fullName = `${userInfo.name}:${userInfo.mobile}`
    await firebase.firestore().collection('customers').doc(userId).update({
      storeId: firebase.firestore.FieldValue.delete(),
      fullName
    })  
  }
  const colors = userInfo.colors.map(c => randomColors.find(rc => rc.name === c).id)
  const password = colors.join('')
  await firebase.auth().signInWithEmailAndPassword(userInfo.mobile + '@gmail.com', userInfo.mobile.substring(9, 2) + password)
  await firebase.auth().currentUser.updateProfile({
    displayName: type,
    photoURL: storeId
  })
  return firebase.auth().signOut()
}

export const registerUser = async (email, password) => {
  await firebase.auth().createUserWithEmailAndPassword(email, password)
  return firebase.auth().currentUser.updateProfile({
    displayName: 'a'
  })
}

export const deleteLog = log => {
  return firebase.firestore().collection('logs').doc(log.id).delete()
}

export const archiveProduct = async (product, packs) => {
  const batch = firebase.firestore().batch()
  const productRef = firebase.firestore().collection('products').doc(product.id)
  batch.update(productRef, {
    isArchived: true
  })
  const affectedPacks = packs.filter(p => p.productId === product.id)
  affectedPacks.forEach(p => {
    const packRef = firebase.firestore().collection('packs').doc(p.id)
    batch.update(packRef, {
      isArchived: true
    })
  })
  return batch.commit()
}

export const getArchivedProducts = async () => {
  let products = []
  await firebase.firestore().collection('products')
          .where('isArchived', '==', true)
          .get().then(docs => {
    docs.forEach(doc => {
      products.push({...doc.data(), id:doc.id})
    })
  })
  return products
}

export const getArchivedPacks = async () => {
  let packs = []
  await firebase.firestore().collection('packs')
          .where('isArchived', '==', true)
          .get().then(docs => {
    docs.forEach(doc => {
      packs.push({...doc.data(), id:doc.id})
    })
  })
  return packs
}

export const approveDebitRequest = userId => {
  return firebase.firestore().collection('users').doc(userId).update({
    debitRequestStatus: 'a',
  })
}
