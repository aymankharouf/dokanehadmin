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

export const quantityText = (quantity, weight) => {
  return weight && weight !== quantity ? `${quantityText(quantity)}(${quantityText(weight)})` : quantity === Math.trunc(quantity) ? quantity.toString() : quantity.toFixed(3)
}

export const quantityDetails = basketPack => {
  let text = `${labels.requested}: ${quantityText(basketPack.quantity)}`
  if (basketPack.purchased > 0) {
    text += `, ${labels.purchased}: ${quantityText(basketPack.purchased, basketPack.weight)}`
  }
  if (basketPack.returned > 0) {
    text += `, ${labels.returned}: ${quantityText(basketPack.returned)}`
  }
  return text
}

export const addQuantity = (q1, q2, q3 = 0) => {
  return Math.trunc(q1 * 1000 + q2 * 1000 + q3 * 1000) / 1000
  }

export const productOfText = (trademark, country) => {
  return trademark ? `${labels.productFrom} ${trademark}-${country}` : `${labels.productOf} ${country}`
}

export const login = (email, password) => {
  return firebase.auth().signInWithEmailAndPassword(email, password)
}

export const logout = () => {
  firebase.auth().signOut()
}

export const updateOrder = (batch, storeId, order, basketPack, purchaseId) => {
  const basket = order.basket.slice()
  const orderPackIndex = basket.findIndex(p => p.packId === basketPack.packId)
  const orderPack = basket[orderPackIndex]
  let actual
  if (orderPack.price < basketPack.actual && basketPack.exceedPriceType === 'o') {
    actual = orderPack.price
  } else {
    actual = basketPack.actual
  }
  let orderStatus = 'e'
  const orderPackQuantity = orderPack.weight || 0
  const newWeight = addQuantity(orderPack.weight || 0, basketPack.weight)
  const newPurchased = addQuantity(orderPack.purchased, basketPack.quantity)
  const avgCost = orderPackQuantity === 0 ? basketPack.cost : Math.trunc((orderPack.cost * orderPackQuantity + basketPack.cost * basketPack.weight) / newWeight)
  const avgActual = orderPackQuantity === 0 ? actual : Math.trunc((orderPack.actual * orderPackQuantity + basketPack.actual * basketPack.weight) / newWeight)
  let status = basketPack.isDivided ? 'f' : (orderPack.quantity === addQuantity(orderPack.purchased, basketPack.quantity) ? 'f' : 'p')
  basket.splice(orderPackIndex, 1, {
    ...orderPack,
    purchased: newPurchased,
    storeId: orderPack.storeId && orderPack.storeId !== storeId ? 'm' : storeId,
    cost: avgCost,
    actual: avgActual,
    gross: status === 'f' ? Math.trunc(avgActual * newWeight) : Math.trunc(avgActual * newWeight) + Math.trunc(orderPack.price * addQuantity(orderPack.quantity, -1 * newPurchased)),
    weight: newWeight,
    status,
    lastPurchaseId: purchaseId,
    lastPurchased: basketPack.quantity,
    lastWeight: basketPack.weight,
    prevStoreId: orderPack.storeId || ''
  })
  if (basket.length === basket.filter(p => ['f', 'u', 'pu'].includes(p.status)).length) {
    orderStatus = 'f'
  }
  const profit = basket.reduce((sum, p) => sum + ['p', 'f', 'pu'].includes(p.status) ? Math.trunc((p.actual - p.cost) * (p.weight || p.purchased)) : 0, 0)
  const total = basket.reduce((sum, p) => sum + (p.gross || 0), 0)
  const fixedFees = Math.trunc(setup.fixedFees * total)
  const fraction = (total + fixedFees) - Math.floor((total + fixedFees) / 50) * 50
  const orderRef = firebase.firestore().collection('orders').doc(order.id)
  batch.update(orderRef, {
    basket,
    profit,
    total,
    fixedFees,
    fraction,
    status: orderStatus,
    lastUpdate: new Date()
  })
}

export const updateOrders = (batch, storeId, orders, basketPack, purchaseId) => {
  let remaining = basketPack.quantity
  let orderPack, otherPacks, purchased, orderStatus, avgCost, avgActual, status
  let basket, profit, total, fixedFees, fraction, orderRef, actual
  for (let o of orders){
    if (remaining <= 0) break
    orderPack = o.basket.find(p => p.packId === basketPack.packId)
    if (orderPack.price < basketPack.actual && basketPack.exceedPriceType === 'o') {
      actual = orderPack.price
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
    avgCost = orderPack.purchased === 0 ? basketPack.cost : Math.trunc((orderPack.cost * orderPack.purchased + basketPack.cost * purchased) / addQuantity(orderPack.purchased, purchased))
    avgActual = orderPack.purchased === 0 ? actual : Math.trunc((orderPack.actual * orderPack.purchased + actual * purchased) / addQuantity(orderPack.purchased, purchased))
    status = orderPack.quantity === addQuantity(orderPack.purchased, purchased) ? 'f' : 'p'
    basket = [
      ...otherPacks, 
      {
        ...orderPack, 
        purchased: addQuantity(orderPack.purchased, purchased),
        storeId: orderPack.storeId && orderPack.storeId !== storeId ? 'm' : storeId,
        cost: avgCost,
        actual: avgActual,
        gross: status === 'f' ? Math.trunc(avgActual * addQuantity(orderPack.purchased, purchased)) : Math.trunc(avgActual * addQuantity(orderPack.purchased, purchased)) + Math.trunc(orderPack.price * addQuantity(orderPack.quantity, -1 * orderPack.purchased, -1 * purchased)),
        status,
        lastPurchaseId: purchaseId || '',
        lastPurchased: purchased,
        prevStoreId: orderPack.storeId || ''
      }
    ]
    if (basket.length === basket.filter(p => ['f', 'u', 'pu'].includes(p.status)).length) {
      orderStatus = 'f'
    }
    profit = basket.reduce((sum, p) => sum + ['p', 'f', 'pu'].includes(p.status) ? Math.trunc((p.actual - p.cost) * (p.weight || p.purchased)) : 0, 0)
    total = basket.reduce((sum, p) => sum + (p.gross || 0), 0)
    fixedFees = Math.trunc(setup.fixedFees * total)  
    fraction = (total + fixedFees) - Math.floor((total + fixedFees) / 50) * 50
    orderRef = firebase.firestore().collection('orders').doc(o.id)
    batch.update(orderRef, {
      basket,
      profit,
      total,
      fixedFees,
      fraction,
      status: orderStatus,
      lastUpdate: new Date()
    })
    remaining -=  purchased
  }
  return remaining
}

export const updateOrderStatus = (order, type, packPrices, packs, blockUserFlag, batch) => {
  const newBatch = batch || firebase.firestore().batch()
  const orderRef = firebase.firestore().collection('orders').doc(order.id)
  newBatch.update(orderRef, {
    status: type,
    lastUpdate: new Date()
  })
  let customerRef, basket
  if (type === 'a') {
    customerRef = firebase.firestore().collection('customers').doc(order.userId)
    newBatch.update(customerRef, {
      ordersCount: firebase.firestore.FieldValue.increment(1)
    }) 
    if (order.discount.type === 'o') { 
      newBatch.update(customerRef, {
        discounts: firebase.firestore.FieldValue.increment(-1 * order.discount.value)
      })  
    }
    sendNotification(order.userId, labels.approval, labels.approveOrder, newBatch)
  } else if (type === 'c') {
    if (order.discount.type === 'o') {
      customerRef = firebase.firestore().collection('customers').doc(order.userId)
      newBatch.update(customerRef, {
        discounts: firebase.firestore.FieldValue.increment(order.discount.value)
      })  
    }
  } else if (type === 'i') {
    basket = order.basket.filter(p => p.purchased > 0)
    basket = basket.map(p => {
      return {
        ...p,
        quantity: p.purchased
      }
    })
    stockIn(newBatch, 'i', basket, packPrices, packs)
    if (blockUserFlag) {
      customerRef = firebase.firestore().collection('customers').doc(order.userId)
      newBatch.update(customerRef, {
        isBlocked: true
      })
      sendNotification(order.userId, labels.notice, labels.customerHasBeenBlocked, newBatch)
    }
  } else if (type === 'd'){
    basket = order.basket.filter(p => p.returned > 0)
    if (basket.length > 0) {
      basket = basket.map(p => {
        return {
          ...p,
          quantity: p.returned
        }
      })
      stockIn(newBatch, 'i', basket, packPrices, packs)  
    }
    order.basket.forEach(p => {
      const packInfo = packs.find(pa => pa.id === p.packId)
      const productRef = firebase.firestore().collection('products').doc(packInfo.productId)
      newBatch.update(productRef, {
        sales: firebase.firestore.FieldValue.increment(p.purchased)
      })
      const affectedPacks = packs.filter(pa => pa.productId === packInfo.productId)
      affectedPacks.forEach(pa => {
        const packRef = firebase.firestore().collection('packs').doc(pa.id)
        newBatch.update(packRef, {
          sales: firebase.firestore.FieldValue.increment(p.purchased)
        })
      })
    })
    customerRef = firebase.firestore().collection('customers').doc(order.userId)
    newBatch.update(customerRef, {
      deliveredOrdersCount: firebase.firestore.FieldValue.increment(1),
      deliveredOrdersTotal: firebase.firestore.FieldValue.increment(order.total)
    })  
  }
  if (!batch) {
    newBatch.commit()
  }
}

const stockIn = (batch, type, basket, packPrices, packs, storeId, purchaseId) => {
  const transRef = firebase.firestore().collection('stock-trans').doc()
  const newBasket = basket.map(p => {
    return {
      packId: p.packId,
      price: Math.trunc(p.cost * (1 + setup.profit)),
      quantity: p.quantity,
      cost: p.cost
    }
  })
  const total = newBasket.reduce((sum, p) => sum + Math.trunc(p.cost * p.quantity), 0)
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
    packStockIn(batch, p, packPrices, packs)
  })
}

const packStockIn = (batch, basketPack, packPrices, packs) => {
  let stock = packPrices.find(p => p.packId === basketPack.packId && p.storeId === 's')
  const pack = packs.find(p => p.id === basketPack.packId)
  const prices = pack.prices?.slice() || []
  let packRef, newStock
  if (stock) {
    const avgPrice = Math.trunc((stock.quantity * stock.price + basketPack.quantity * basketPack.price) / addQuantity(basketPack.quantity, stock.quantity))
    const avgCost = Math.trunc((stock.quantity * stock.cost + basketPack.quantity * basketPack.cost) / addQuantity(basketPack.quantity, stock.quantity))
    const { packId, ...others } = stock
    newStock = {
      ...others,
      price: avgPrice, 
      cost: avgCost, 
      quantity: addQuantity(basketPack.quantity, stock.quantity), 
      time: new Date()
    }
    const storeIndex = prices.findIndex(p => p.storeId === 's')
    prices.splice(storeIndex, 1, newStock)
  } else {
    newStock = {
      storeId: 's',
      price: basketPack.price, 
      cost: basketPack.cost, 
      quantity: basketPack.quantity, 
      time: new Date()
    }
    prices.push(newStock)
  }
  packRef = firebase.firestore().collection('packs').doc(pack.id)
  batch.update(packRef, {
    prices
  })
  if (!stock || stock.price === pack.price || newStock.price < pack.price) {
    const { minPrice, minStoreId, weightedPrice, offerEnd } = getMinPrice(newStock, pack, packPrices, packs, false)
    const packRef = firebase.firestore().collection('packs').doc(basketPack.packId)
    batch.update(packRef, {
      price: minPrice,
      weightedPrice,
      offerEnd,
      minStoreId
    })
  }
}

export const confirmPurchase = (basket, orders, storeId, packPrices, packs, total) => {
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
    type: 'p',
    basket: packBasket,
    total,
    isArchived: false,
    time: new Date()
  })
  const storeRef = firebase.firestore().collection('stores').doc(storeId)
  batch.update(storeRef, {
    balance: firebase.firestore.FieldValue.increment(-1 * total)
  })
  let packOrders, remaining, packInfo, pack, quantity
  let packsIn = []
  const approvedOrders = orders.filter(o => ['a', 'e'].includes(o.status))
  basket.forEach(p => {
    packInfo = packs.find(pa => pa.id === p.packId)
    if (p.weight) {
      if (p.orderId) {
        const order = orders.find(o => o.id === p.orderId)
        updateOrder(batch, storeId, order, p, purchaseRef.id)
      } else {
        packsIn.push(p)
      }
    } else {
      packOrders = approvedOrders.filter(o => o.basket.find(op => op.packId === p.packId && (p.price === 0 || p.price === op.price) && ['n', 'p'].includes(op.status)))
      packOrders.sort((o1, o2) => o1.time.seconds - o2.time.seconds)
      remaining = updateOrders(batch, storeId, packOrders, p, purchaseRef.id)
      if (remaining > 0) {
        if (packInfo.subPackId) {
          pack = {
            packId: packInfo.subPackId,
            quantity: remaining * packInfo.subQuantity,
            cost: Math.trunc(p.cost / packInfo.subQuantity * packInfo.subPercent),
            actual: Math.trunc(p.actual / packInfo.subQuantity * packInfo.subPercent),
            isOffer: p.isOffer,
            exceedPriceType: p.exceedPriceType
          }
          packOrders = approvedOrders.filter(o => o.basket.find(op => op.packId === packInfo.subPackId && op.price === p.price && ['n', 'p'].includes(op.status)))
          packOrders.sort((o1, o2) => o1.time.seconds - o2.time.seconds)
          quantity = updateOrders(batch, storeId, packOrders, pack, purchaseRef.id)
          if (quantity > 0) {
            packsIn.push({...pack, quantity})
          }
          if (packInfo.bonusPackId){
            pack = {
              packId: packInfo.bonusPackId,
              quantity: remaining * packInfo.bonusQuantity,
              cost: Math.trunc(p.cost / packInfo.bonusQuantity * packInfo.bonusPercent),
              actual: Math.trunc(p.actual / packInfo.bonusQuantity * packInfo.bonusPercent),
              isOffer: p.isOffer,
              exceedPriceType: p.exceedPriceType
            }
            packOrders = approvedOrders.filter(o => o.basket.find(op => op.packId === packInfo.bonusPackId && op.price === p.price && ['n', 'p'].includes(op.status)))
            packOrders.sort((o1, o2) => o1.time.seconds - o2.time.seconds)
            quantity = updateOrders(batch, storeId, packOrders, pack, purchaseRef.id)
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
    stockIn(batch, 'p', packsIn, packPrices, packs, storeId, purchaseRef.id)
  }
  batch.commit()
}

export const stockOut = (basket, orders, packPrices, packs) => {
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
  const total = packBasket.reduce((sum, p) => sum + Math.trunc(p.price * p.quantity), 0)
  batch.set(transRef, {
    basket: packBasket,
    type: 'o',
    total,
    isArchived: false,
    time: new Date()
  })
  const approvedOrders = orders.filter(o => ['a', 'e'].includes(o.status))
  basket.forEach(p => {
    if (p.orderId) {
      const order = orders.find(o => o.id === p.orderId)
      updateOrder(batch, 's', order, p)
    } else {
      let packOrders = approvedOrders.filter(o => o.basket.find(op => op.packId === p.packId && op.price === p.price))
      packOrders.sort((o1, o2) => o1.time.seconds - o2.time.seconds)
      updateOrders(batch, 's', packOrders, p)
    }
    packStockOut(batch, p, packPrices, packs)
  })
  batch.commit()
}

const packStockOut = (batch, basketPack, packPrices, packs) => {
  const stock = packPrices.find(s => s.packId === basketPack.packId && s.storeId === 's')
  const pack = packs.find(p => p.id === basketPack.packId)
  const prices = pack.prices.slice()
  const storeIndex = prices.findIndex(p => p.storeId === 's')
  const packRef = firebase.firestore().collection('packs').doc(pack.id)
  const { packId, ...others } = stock
  if (addQuantity(stock.quantity, -1 * basketPack.quantity) > 0) {
    prices.splice(storeIndex, 1, {
      ...others,
      quantity: addQuantity(stock.quantity, -1 * basketPack.quantity)
    })
    batch.update(packRef, {
      prices
    })
  } else {
    prices.splice(storeIndex, 1, {
      ...others,
      price: 0,
      cost: 0,
      quantity: 0, 
    })
    const { minPrice, minStoreId, weightedPrice, offerEnd } = getMinPrice(stock, pack, packPrices, packs, true)
    batch.update(packRef, {
      prices,
      price: minPrice,
      weightedPrice,
      offerEnd,
      minStoreId
    })
  }
}

export const addPackPrice = (storePack, packPrices, packs, batch) => {
  const newBatch = batch || firebase.firestore().batch()
  const { packId, ...others } = storePack
  const pack = packs.find(p => p.id === packId)
  let packRef = firebase.firestore().collection('packs').doc(pack.id)
  newBatch.update(packRef, {
    prices: firebase.firestore.FieldValue.arrayUnion(others)
  })
  let newPack = pack
  if (storePack.cost !== storePack.price && storePack.storeId !== 's' && pack.subPackId) { //from type 5
    newPack = packs.find(p => p.id === pack.subPackId)
  }
  if (storePack.isActive && (storePack.price < newPack.price || newPack.price === 0)) {
    const { minPrice, minStoreId, weightedPrice, offerEnd } = getMinPrice(storePack, newPack, packPrices, packs, false)
    packRef = firebase.firestore().collection('packs').doc(newPack.id)
    newBatch.update(packRef, {
      price: minPrice,
      weightedPrice,
      offerEnd,
      minStoreId
    })
  }
  if (!batch) {
    newBatch.commit()
  }
}

export const addProduct = async (product, image) => {
  const productRef = firebase.firestore().collection('products').doc()
  let imageUrl = ''
  if (image) {
    const filename = image.name
    const ext = filename.slice(filename.lastIndexOf('.'))
    const fileData = await firebase.storage().ref().child('products/' + productRef.id + ext).put(image)
    imageUrl = await firebase.storage().ref().child(fileData.metadata.fullPath).getDownloadURL()
  }
  product['imageUrl'] = imageUrl
  productRef.set(product)
}

export const deleteProduct = async product => {
  if (product.imageUrl) {
    try{
      await firebase.storage().ref().child('products/' + product.id + '.jpg').delete()
    } catch {
      await firebase.storage().ref().child('products/' + product.id + '.jpeg').delete()
    }  
  }
  firebase.firestore().collection('products').doc(product.id).delete()
}

export const editProduct = async (product, oldName, image, packs) => {
  const batch = firebase.firestore().batch()
  const { id, ...others } = product
  let imageUrl
  if (image) {
    const filename = image.name
    const ext = filename.slice(filename.lastIndexOf('.'))
    const fileData = await firebase.storage().ref().child('products/' + id + ext).put(image)
    imageUrl = await firebase.storage().ref().child(fileData.metadata.fullPath).getDownloadURL()
    others['imageUrl'] = imageUrl
  }
  const productRef = firebase.firestore().collection('products').doc(id)
  batch.update(productRef, others)
  let affectedPacks = packs.filter(p => p.productId === id)
  affectedPacks.forEach(p => {
    const packRef = firebase.firestore().collection('packs').doc(p.id)
    const packInfo = {
      productName: product.name,
      productAlias: product.alias,
      productDescription: product.description,
      categoryId: product.categoryId,
      country: product.country,
      trademark: product.trademark,
      sales: product.sales,
      rating: product.rating,
      ratingCount: product.ratingCount
    }
    if (image && ((!p.subPackId && !p.specialImage) || (p.subPackId && !p.specialImage && packs.find(sp => sp.id === p.subPackId).specialImage === false))) {
      packInfo['imageUrl'] = imageUrl
    }
    batch.update(packRef, packInfo)
  })
  if (product.name !== oldName) {
    affectedPacks = packs.filter(p => packs.find(bp => bp.id === p.bonusPackId && bp.productId === id))
    affectedPacks.forEach(p => {
      const packRef = firebase.firestore().collection('packs').doc(p.id)
      batch.update(packRef, {
        bonusProductName: product.name,
      })
    })
  }
  batch.commit()
}

export const editPrice = (storePack, oldPrice, packPrices, packs, batch) => {
  const newBatch = batch || firebase.firestore().batch()
  const { packId, ...others } = storePack
  const pack = packs.find(p => p.id === packId)
  const prices = pack.prices.slice()
  const storeIndex = prices.findIndex(p => p.storeId === storePack.storeId)
  prices.splice(storeIndex, 1, others)
  const packRef = firebase.firestore().collection('packs').doc(packId)
  newBatch.update(packRef, {
    prices
  })
  let newPack = pack
  if (storePack.cost !== storePack.price && storePack.storeId !== 's' && pack.subPackId) { //from type 5
    newPack = packs.find(p => p.id === pack.subPackId)
  } 
  if (storePack.isActive && (storePack.price < newPack.price || newPack.price === 0 || newPack.price === oldPrice)) {
    const { minPrice, minStoreId, weightedPrice, offerEnd } = getMinPrice(storePack, newPack, packPrices, packs, false)
    const packRef = firebase.firestore().collection('packs').doc(newPack.id)
    newBatch.update(packRef, {
      price: minPrice,
      weightedPrice,
      offerEnd,
      minStoreId
    })
  }
  if (!batch) {
    newBatch.commit()
  }
}

export const changeStorePackStatus = (storePack, packPrices, packs) => {
  const batch = firebase.firestore().batch()
  const { packId, ...others } = storePack
  const pack = packs.find(p => p.id === packId)
  const prices = pack.prices.slice()
  const storeIndex = prices.findIndex(p => p.storeId === storePack.storeId)
  prices.splice(storeIndex, 1, {
    ...others,
    isActive: !storePack.isActive
  })
  const packRef = firebase.firestore().collection('packs').doc(packId)
  batch.update(packRef, {
    prices
  })
  let newPack = pack
  if (storePack.cost !== storePack.price && storePack.storeId !== 's' && pack.subPackId) { //from type 5
    newPack = packs.find(p => p.id === pack.subPackId)
  } 
  if ((storePack.isActive && storePack.price === newPack.price) || (!storePack.isActive && (storePack.price < newPack.price || newPack.price === 0))) {
    const { minPrice, minStoreId, weightedPrice, offerEnd } = getMinPrice(storePack, newPack, packPrices, packs, false)
    const packRef = firebase.firestore().collection('packs').doc(newPack.id)
    batch.update(packRef, {
      price: minPrice,
      weightedPrice,
      offerEnd,
      minStoreId
    })
  }
  batch.commit()
}

export const haltOffer = (storePack, packPrices, packs) => {
  const batch = firebase.firestore().batch()
  const { packId, ...others } = storePack
  const pack = packs.find(p => p.id === packId)
  const prices = pack.prices.slice()
  const storeIndex = prices.findIndex(p => p.storeId === storePack.storeId)
  prices.splice(storeIndex, 1, {
    ...others,
    price: 0,
    cost: 0
  })
  const packRef = firebase.firestore().collection('packs').doc(packId)
  batch.update(packRef, {
    prices
  })
  if (storePack.price === pack.price) {
    const { minPrice, minStoreId, weightedPrice, offerEnd } = getMinPrice(storePack, pack, packPrices, packs, true)
    const packRef = firebase.firestore().collection('packs').doc(storePack.packId)
    batch.update(packRef, {
      price: minPrice,
      weightedPrice,
      offerEnd,
      minStoreId
    })
  }
  batch.commit()
}

const getMinPrice = (storePack, pack, packPrices, packs, isDeletion) => {
  let packStores = packPrices.filter(p => (p.packId === pack.id || (p.cost !== p.price && packs.find(pa => pa.id === p.packId && pa.subPackId === pack.id))) && p.price > 0 && p.isActive)
  packStores = packStores.filter(s => s.storeId !== storePack.storeId)
  if (!isDeletion){
    packStores.push(storePack)
  }
  const stock = packStores.find(s => s.storeId === 's')
  if (stock && stock.quantity > 0) {
    packStores = packStores.filter(s => s.cost === s.price || s.storeId === 's') //omit type 5
  }
  let minPrice, weightedPrice, offerEnd, minStoreId = ''
  if (packStores.length === 0){
    minPrice = 0
    weightedPrice = 0
    offerEnd = ''
  } else {
    const prices = packStores.map(s => s.price)
    minPrice = Math.min(...prices)
    weightedPrice = minPrice / pack.unitsCount
    packStores.sort((p1, p2) => (p2.offerEnd ? p2.offerEnd.toDate() : moment().add(1000, 'days')) - (p1.offerEnd ? p1.offerEnd.toDate() : moment().add(1000, 'days')))
    offerEnd = packStores.find(s => s.price === minPrice).offerEnd
    if (packStores.filter(s => s.price === minPrice).length === 1) {
      minStoreId = packStores.find(s => s.price === minPrice).storeId
    }
  }
  return {minPrice, minStoreId, weightedPrice, offerEnd}
}

export const refreshPackPrice = (pack, packPrices, packs) => {
  let packStores = packPrices.filter(p => (p.packId === pack.id || (p.cost !== p.price && packs.find(pa => pa.id === p.packId && pa.subPackId === pack.id))) && p.price > 0)
  const stock = packStores.find(s => s.storeId === 's')
  if (stock && stock.quantity > 0) {
    packStores = packStores.filter(s => s.cost === s.price || s.storeId === 's') //omit type 5
  }
  let minPrice, weightedPrice, offerEnd, minStoreId = ''
  if (packStores.length === 0){
    minPrice = 0
    weightedPrice = 0
    offerEnd = ''
  } else {
    const prices = packStores.map(s => s.price)
    minPrice = Math.min(...prices)
    weightedPrice = minPrice / pack.unitsCount
    packStores.sort((p1, p2) => (p2.offerEnd ? p2.offerEnd.toDate() : moment().add(1000, 'days')) - (p1.offerEnd ? p1.offerEnd.toDate() : moment().add(1000, 'days')))
    offerEnd = packStores.find(s => s.price === minPrice).offerEnd
    if (packStores.filter(s => s.price === minPrice).length === 1) {
      minStoreId = packStores.find(s => s.price === minPrice).storeId
    }
  }  
  firebase.firestore().collection('packs').doc(pack.id).update({
    price: minPrice,
    weightedPrice,
    offerEnd,
    minStoreId
  })
}

export const deleteStorePack = (storePack, packPrices, packs, batch) => {
  const newBatch = batch || firebase.firestore().batch()
  const pack = packs.find(p => p.id === storePack.packId)
  const prices = pack.prices.slice()
  const storeIndex = prices.findIndex(p => p.storeId === storePack.storeId)
  prices.splice(storeIndex, 1)
  const packRef = firebase.firestore().collection('packs').doc(pack.id)
  newBatch.update(packRef, {
    prices
  })
  let newPack = pack
  if (storePack.cost !== storePack.price && storePack.storeId !== 's' && pack.subPackId) { //from type 5
    newPack = packs.find(p => p.id === pack.subPackId)
  } 
  if (storePack.price === newPack.price) {
    const { minPrice, minStoreId, weightedPrice, offerEnd } = getMinPrice(storePack, newPack, packPrices, packs, true)
    const packRef = firebase.firestore().collection('packs').doc(newPack.id)
    newBatch.update(packRef, {
      price: minPrice,
      weightedPrice,
      offerEnd,
      minStoreId
    })
  }
  if (!batch) {
    newBatch.commit()
  }
}

export const addStore = store => {
  firebase.firestore().collection('stores').add(store)
}

export const editStore = store => {
  const { id, ...others } = store
  firebase.firestore().collection('stores').doc(id).update(others)
}

export const addStock = () => {
  firebase.firestore().collection('stores').doc('s').set({
    name: labels.stockName,
    type: '1'
  })
}

export const addSpending = spending => {
  firebase.firestore().collection('spendings').add(spending)
}

export const editSpending = spending => {
  const { id, ...others } = spending
  firebase.firestore().collection('spendings').doc(id).update(others)
}

export const addCountry = name => {
  firebase.firestore().collection('lookups').doc('c').set({
    values: firebase.firestore.FieldValue.arrayUnion(name)
  }, {merge: true})
}

export const deleteCountry = name => {
  firebase.firestore().collection('lookups').doc('c').set({
    values: firebase.firestore.FieldValue.arrayRemove(name)
  }, {merge: true})
}

export const editCountry = (name, oldName, products, packs) => {
  const batch = firebase.firestore().batch()
  const countriesRef = firebase.firestore().collection('lookups').doc('c')
  batch.update(countriesRef, {
    values: firebase.firestore.FieldValue.arrayRemove(oldName)
  })
  batch.update(countriesRef, {
    values: firebase.firestore.FieldValue.arrayUnion(name)
  })
  const affectedProducts = products.filter(p => p.country === oldName)
  affectedProducts.forEach(p => {
    const productRef = firebase.firestore().collection('products').doc(p.id)
    batch.update(productRef, {
      country: name
    })
    const affectedPacks = packs.filter(pa => pa.productId === p.id)
    affectedPacks.forEach(pa => {
      const packRef = firebase.firestore().collection('packs').doc(pa.id)
      batch.update(packRef, {
        country: name
      })
    })
  })
  batch.commit()
}

export const addLocation = location => {
  firebase.firestore().collection('lookups').doc('l').set({
    values: firebase.firestore.FieldValue.arrayUnion(location)
  }, {merge: true})
}

export const editLocation = (location, locations) => {
  const values = locations.slice()
  const locationIndex = values.findIndex(l => l.id === location.id)
  values.splice(locationIndex, 1, location)
  firebase.firestore().collection('lookups').doc('l').update({
    values
  })
}

export const addCategory = (parentId, name, ordering) => {
  const batch = firebase.firestore().batch()
  let categoryRef
  if (parentId !== '0') {
    categoryRef = firebase.firestore().collection('categories').doc(parentId)
    batch.update(categoryRef, {
      isLeaf: false
    })
  }
  categoryRef = firebase.firestore().collection('categories').doc()
  batch.set(categoryRef, {
    parentId,
    name,
    ordering,
    isLeaf: true,
    isActive: false
  })
  batch.commit()
}

export const editCategory = (category, oldParentId, categories) => {
  const batch = firebase.firestore().batch()
  const { id, ...others } = category
  let categoryRef = firebase.firestore().collection('categories').doc(id)
  batch.update(categoryRef, others)
  if (category.parentId !== oldParentId) {
    categoryRef = firebase.firestore().collection('categories').doc(category.parentId)
    batch.update(categoryRef, {
      isLeaf: false
    })
    const childrenCount = categories.filter(c => c.id !== id && c.parentId === oldParentId)
    if (childrenCount === 0) {
      categoryRef = firebase.firestore().collection('categories').doc(oldParentId)
      batch.update(categoryRef, {
        isLeaf: true
      })  
    }
  }
  batch.commit()
}

export const deleteCategory = (category, categories) => {
  const batch = firebase.firestore().batch()
  let categoryRef = firebase.firestore().collection('categories').doc(category.id).delete()
  const childrenCount = categories.filter(c => c.id !== category.id && c.parentId === category.parentId)
  if (childrenCount === 0) {
    categoryRef = firebase.firestore().collection('categories').doc(category.parentId)
    batch.update(categoryRef, {
      isLeaf: true
    })
  }
  batch.commit()
}

export const getCategoryName = (category, categories) => {
  if (category.parentId === '0') {
    return category.name
  } else {
    const categoryParent = categories.find(c => c.id === category.parentId)
    return getCategoryName(categoryParent, categories) + '-' + category.name
  }
}

export const resolvePasswordRequest = requestId => {
  firebase.firestore().collection('password-requests').doc(requestId).delete()
}

export const addPack = async (pack, product, image, subPackInfo) => {
  const packRef = firebase.firestore().collection('packs').doc()
  let imageUrl, specialImage
  if (image) {
    const filename = image.name
    const ext = filename.slice(filename.lastIndexOf('.'))
    const fileData = await firebase.storage().ref().child('packs/' + packRef.id + ext).put(image)
    imageUrl = await firebase.storage().ref().child(fileData.metadata.fullPath).getDownloadURL()
    specialImage = true
  } else {
    imageUrl = subPackInfo?.imageUrl || product.imageUrl
    specialImage = false
  }
  packRef.set({
    ...pack,
    productId: product.id,
    productName: product.name,
    productAlias: product.alias,
    productDescription: product.description,
    categoryId: product.categoryId,
    country: product.country,
    trademark: product.trademark,
    sales: product.sales,
    rating: product.rating,
    ratingCount: product.ratingCount,
    imageUrl,
    specialImage
  })
}

export const deletePack = packId => {
  firebase.firestore().collection('packs').doc(packId).delete()
}

export const editPack = async (newPack, oldPack, image, packs) => {
  const batch = firebase.firestore().batch()
  const { id, ...others } = newPack
  let imageUrl
  if (image) {
    const filename = image.name
    const ext = filename.slice(filename.lastIndexOf('.'))
    const fileData = await firebase.storage().ref().child('packs/' + id + ext).put(image)
    imageUrl = await firebase.storage().ref().child(fileData.metadata.fullPath).getDownloadURL()
    others['specialImage'] = true
    others['imageUrl'] = imageUrl
  } 
  const packRef = firebase.firestore().collection('packs').doc(id)
  batch.update(packRef, others)
  let affectedPacks = packs.filter(p => p.subPackId === id)
  affectedPacks.forEach(p => {
    const packRef = firebase.firestore().collection('packs').doc(p.id)
    const packInfo = {
      subPackName: newPack.name,
      unitsCount: p.subQuantity * newPack.unitsCount,
      isDivided: newPack.isDivided,
      byWeight: newPack.byWeight
    }
    if (image && !p.specialImage) {
      packInfo['imageUrl'] = imageUrl
    }
    batch.update(packRef, packInfo)
  })
  if (newPack.name !== oldPack.name) {
    affectedPacks = packs.filter(p => p.bonusPackId === id)
    affectedPacks.forEach(p => {
      const packRef = firebase.firestore().collection('packs').doc(p.id)
      batch.update(packRef, {
        bonusPackName: newPack.name
      })
    })
  }
  batch.commit()
}

export const editCustomer = (customer, mobile, storeId, stores) => {
  const batch = firebase.firestore().batch()
  const { id, ...others } = customer
  const customerRef = firebase.firestore().collection('customers').doc(id)
  const storeName = storeId ? `-${stores.find(s => s.id === storeId).name}`: ''
  batch.update(customerRef, {
    ...others,
    fullName: `${customer.name}${storeName}:${mobile}`,
  })
  const userRef = firebase.firestore().collection('users').doc(id)
  batch.update(userRef, {
    name: customer.name,
  })
  batch.commit()
}

export const approveUser = (id, name, mobile, mobileCheck, locationId, otherMobile, storeName, address, users) => {
  const batch = firebase.firestore().batch()
  const customerRef = firebase.firestore().collection('customers').doc(id)
  batch.set(customerRef, {
    name,
    fullName: `${name}:${mobile}`,
    orderLimit: '',
    isBlocked: mobileCheck ? true : false,
    storeName,
    address,
    deliveryFees: '',
    specialDiscount: '',
    discounts: 0,
    mapPosition: '',
    otherMobile,
    ordersCount: 0,
    deliveredOrdersCount: 0,
    returnedCount: 0,
    deliveredOrdersTotal: 0,
    time: new Date()
  })
  const userRef = firebase.firestore().collection('users').doc(id)
  batch.update(userRef, {
    name,
    locationId,
    storeName: firebase.firestore.FieldValue.delete()
  })
  const invitedBy = users.filter(u => u.friends?.find(f => f.mobile === mobile))
  invitedBy.forEach(u => {
    const friends = u.friends.slice()
    const invitationIndex = friends.findIndex(f => f.mobile === mobile)
    friends.splice(invitationIndex, 1, {
      ...u.friends[invitationIndex],
      status: 'r'
    })
    const userRef = firebase.firestore().collection('users').doc(u.id)
    batch.update(userRef, {
      friends
    })
    if (u.friends[invitationIndex].status === 's') {
      const customerRef = firebase.firestore().collection('customers').doc(u.id)
      batch.update(customerRef, {
        discounts: firebase.firestore.FieldValue.increment(setup.invitationDiscount)
      })
    }
  })
  batch.commit()
}

export const approveAlarm = (user, alarm, newPackId, customer, packPrices, packs) => {
  const batch = firebase.firestore().batch()
  const alarms = user.alarms.slice()
  const alarmIndex = alarms.findIndex(a => a.id === alarm.id)
  alarms.splice(alarmIndex, 1, {
    ...user.alarms[alarmIndex],
    status: 'a',
    storeId: customer.storeId,
    newPackId
  })
  const userRef = firebase.firestore().collection('users').doc(user.id)
  batch.update(userRef, {
    alarms
  })
  const storePack = packPrices.find(p => p.storeId === customer.storeId && p.packId === (newPackId || alarm.packId))
  let offerEnd = ''
  if (alarm.offerDays) {
    offerEnd = alarm.time.toDate()
    offerEnd.setDate(offerEnd.getDate() + alarm.offerDays)
  }
  const newStorePack = { 
    ...storePack, 
    storeId: customer.storeId,
    cost: alarm.price,
    price: alarm.price,
    offerEnd,
    time: new Date()
  }
  if (alarm.type === 'cp') {
    const oldPrice = storePack.price
    editPrice(newStorePack, oldPrice, packPrices, packs, batch)
    sendNotification(user.id, labels.approval, labels.approveOwnerChangePrice, batch)
  } else if (alarm.type === 'ua') {
    deleteStorePack(storePack, packPrices, packs, batch)
    sendNotification(user.id, labels.approval, labels.approveOwnerDelete, batch)
  } else {
    addPackPrice(newStorePack, packPrices, packs, batch)
    sendNotification(user.id, labels.approval, labels.approveOwnerAddPack, batch)
  }
  batch.commit()
}

export const packUnavailable = (pack, packPrice, orders, overPriced) => {
  const batch = firebase.firestore().batch()
  const packOrders = orders.filter(o => o.basket.find(p => p.packId === pack.id && p.price === packPrice && ['n', 'p'].includes(p.status)))
  packOrders.forEach(o => {
    const basket = o.basket.slice()
    const orderPackIndex = basket.findIndex(p => p.packId === pack.id)
    let orderStatus = 'e'
    basket.splice(orderPackIndex, 1, {
      ...basket[orderPackIndex],
      status: basket[orderPackIndex].purchased > 0 ? 'pu' : 'u',
      gross: Math.trunc((basket[orderPackIndex].actual || 0) * (basket[orderPackIndex].weight || basket[orderPackIndex].purchased)),
      overPriced
    })
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
      discount.value = 0
      discount.type = 'n'
    } else {
      profit = basket.reduce((sum, p) => sum + ['p', 'f', 'pu'].includes(p.status) ? Math.trunc((p.actual - p.cost) * (p.weight || p.purchased)) : 0, 0)
      fixedFees = Math.trunc(setup.fixedFees * total)
      fraction = (total + fixedFees) - Math.floor((total + fixedFees) / 50) * 50
    }
    const lastUpdate = orderStatus === o.status ? (o.lastUpdate || o.time) : new Date()
    const orderRef = firebase.firestore().collection('orders').doc(o.id)
    batch.update(orderRef, {
      basket,
      profit,
      total,
      fixedFees,
      fraction,
      discount,
      status: orderStatus,
      lastUpdate
    })
  })
  batch.commit()
}

export const addMonthlyTrans = (trans, orders, purchases, stockTrans) => {
  const batch = firebase.firestore().batch()
  const transRef = firebase.firestore().collection('monthly-trans').doc(trans.id)
  batch.set(transRef, trans)
  const month = (Number(trans.id) % 100) - 1
  const year = Math.trunc(Number(trans.id) / 100)
  const ordersToArchived = orders.filter(o => ['s', 'r', 'd', 'c', 'm', 'u', 'i'].includes(o.status) && (o.time.toDate()).getFullYear() === year && (o.time.toDate()).getMonth() === month)
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
  batch.commit()
}

export const editOrder = (order, basket, packPrices, packs, batch) => {
  const newBatch = batch || firebase.firestore().batch()
  let returnBasket = basket.filter(p => p.quantity < p.purchased)
  if (returnBasket.length > 0){
    returnBasket = returnBasket.map(p => {
      return {
        ...p,
        quantity: addQuantity(p.purchased, p.quantity)
      }
    })
    stockIn(newBatch, 'i', returnBasket, packPrices, packs)
  }
  let packBasket = basket.filter(p => p.quantity > 0)
  packBasket = packBasket.map(p => {
    const status = p.quantity === p.purchased ? 'f' : p.purchased > 0 ? 'p' : 'n'
    return {
      ...p,
      purchased: Math.min(p.quantity, p.purchased),
      status,
      gross: status === 'f' ? Math.trunc(p.actual * (p.weight || p.purchased)) : Math.trunc((p.actual || 0) * (p.weight || p.purchased)) + Math.trunc(p.price * addQuantity(p.quantity, -1 * p.purchased)),
    }
  })
  const profit = packBasket.reduce((sum, p) => sum + ['p', 'f', 'pu'].includes(p.status) ? Math.trunc((p.actual - p.cost) * (p.weight || p.purchased)) : 0, 0)
  const total = packBasket.reduce((sum, p) => sum + (p.gross || 0), 0)
  const fixedFees = Math.trunc(setup.fixedFees * total)
  const fraction = (total + fixedFees) - Math.floor((total + fixedFees) / 50) * 50
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
  const { id, ...others } = order
  const orderRef = firebase.firestore().collection('orders').doc(id)
  newBatch.update(orderRef, {
    ...others,
    basket: packBasket,
    total,
    profit,
    fixedFees,
    fraction,
    status: orderStatus,
    lastUpdate,
  })
  if (!batch) {
    newBatch.commit()
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
  const ratingIndex = ratings.findIndex(r => r.productId === rating.productInfo.id)
  ratings.splice(ratingIndex, 1, {
    ...ratings[ratingIndex],
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
  const discount = Math.trunc(ratings[ratingIndex].price * setup.discountPercent)
  const customerRef = firebase.firestore().collection('customers').doc(rating.userInfo.id)
  batch.update(customerRef, {
    discounts: firebase.firestore.FieldValue.increment(discount)
  })
  batch.commit()
}

export const returnOrder = (order, orderBasket, locationFees, packPrices, packs) => {
  const batch = firebase.firestore().batch()
  const returnBasket = orderBasket.filter(p => p.quantity < p.oldQuantity)
  let basket = order.basket.slice()
  returnBasket.forEach(p => {
    let status, gross
    const orderPackIndex = basket.findIndex(bp => bp.packId === p.packId)
    if (p.quantity === 0) {
      status = 'r'
      gross = 0
    } else {
      status = 'pr'
      gross = Math.trunc(p.actual * addQuantity(p.purchased, -1 * p.oldQuantity, p.quantity))
    }
    basket.splice(orderPackIndex, 1, {
      ...basket[orderPackIndex],
      status,
      gross,
      returned: addQuantity(p.oldQuantity, -1 * p.quantity),
      quantity: basket[orderPackIndex].quantity // keep original quantity
    })
  })
  const profit = basket.reduce((sum, p) => sum + ['p', 'f', 'pu', 'pr'].includes(p.status) ? Math.trunc((p.actual - p.cost) * addQuantity(p.weight || p.purchased, -1 * (p.returned || 0))) : 0, 0)
  const total = basket.reduce((sum, p) => sum + (p.gross || 0), 0)
  const fixedFees = Math.trunc(setup.fixedFees * total)
  const fraction = (total + fixedFees) - Math.floor((total + fixedFees) / 50) * 50
  const orderRef = firebase.firestore().collection('orders').doc(order.id)
  batch.update(orderRef, {
    basket,
    total,
    profit,
    fixedFees,
    fraction,
    returnPenalty: order.status === 'd' ? locationFees : 0
  })
  if (total === 0) {
    updateOrderStatus(order, 'i', packPrices, packs, false, batch)
  } else if (order.status === 'd') {
    basket = basket.map(p => {
      return {
        ...p,
        quantity: p.returned
      }
    })
    basket = basket.filter(p => p.returned > 0)
    stockIn(batch, 'i', basket, packPrices, packs)  
  }
  const customerRef = firebase.firestore().collection('customers').doc(order.userId)
  if (order.status === 'd') {
    if (total === 0) {
      batch.update(customerRef, {
        deliveredOrdersCount: firebase.firestore.FieldValue.increment(-1),
        deliveredOrdersTotal: firebase.firestore.FieldValue.increment(order.total),
        discounts: firebase.firestore.FieldValue.increment(-1 * setup.returnPenalty),
        returnedCount: firebase.firestore.FieldValue.increment(1)
      })  
    } else {
      batch.update(customerRef, {
        deliveredOrdersTotal: firebase.firestore.FieldValue.increment(total - order.total),
        discounts: firebase.firestore.FieldValue.increment(-1 * setup.returnPenalty),
        returnedCount: firebase.firestore.FieldValue.increment(1)
      })
    }
  } else {
    batch.update(customerRef, {
      discounts: firebase.firestore.FieldValue.increment(-1 * setup.returnPenalty),
      returnedCount: firebase.firestore.FieldValue.increment(1)
    })  
  }
  batch.commit()
}

export const addStockTrans = (batch, returnBasket, storeId, packPrices, packs) => {
  const transRef = firebase.firestore().collection('stock-trans').doc()
  let total = returnBasket.packs.reduce((sum, p) => sum + Math.trunc(p.price * p.quantity), 0)
  const newTrans = {
    basket: returnBasket.packs,
    storeId: storeId || '',
    type: returnBasket.type,
    total,
    isArchived: false,
    time: new Date()
  }
  batch.set(transRef, newTrans)
  returnBasket.packs.forEach(p => {
    packStockOut(batch, p, packPrices, packs)
  })
  if (returnBasket.type === 's') {
    const storeRef = firebase.firestore().collection('stores').doc(storeId)
    batch.update(storeRef, {
      balance: firebase.firestore.FieldValue.increment(total)
    })
  }
}

export const allocateOrderPack = (order, pack, stores) => {
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
    lastUpdate: isFinished ? new Date() : order.lastUpdate
  })
  sendNotification(order.userId, labels.notice, labels.prepareOrder, batch)
  batch.commit()
}

export const approveInvitation = (user, mobile, status) => {
  const batch = firebase.firestore().batch()
  const friends = user.friends.slice()
  const invitationIndex = friends.findIndex(f => f.mobile === mobile)
  friends.splice(invitationIndex, 1, {
    ...user.friends[invitationIndex],
    status
  })
  const userRef = firebase.firestore().collection('users').doc(user.id)
  batch.update(userRef, {
    friends
  })
  if (status === 's') {
    sendNotification(user.id, labels.approval, labels.approveInvitation, batch)
  }
  batch.commit()
}

export const deleteNotification = (user, notificationId) => {
  const notifications = user.notifications.slice()
  const notificationIndex = notifications.findIndex(n => n.id === notificationId)
  notifications.splice(notificationIndex, 1)
  firebase.firestore().collection('users').doc(user.id).update({
    notifications
  })
}

export const sendNotification = (userId, title, message, batch) => {
  const newBatch =  batch || firebase.firestore().batch()
  const userRef = firebase.firestore().collection('users').doc(userId)
  newBatch.update(userRef, {
    notifications: firebase.firestore.FieldValue.arrayUnion({
      id: Math.random().toString(),
      title,
      message,
      status: 'n',
      time: new Date()
    })
  })
  if (!batch) {
    newBatch.commit()
  }
}

export const getArchivedOrders = month => {
  let orders = []
  firebase.firestore().collection('orders')
          .where('isArchived', '==', true)
          .where('archivedMonth', '==', month)
          .get().then(docs => {
    docs.forEach(doc => {
      orders.push({...doc.data(), id:doc.id})
    })
  })
  return orders
}

export const getArchivedPurchases = month => {
  let purchases = []
  firebase.firestore().collection('purchases')
          .where('isArchived', '==', true)
          .where('archivedMonth', '==', month)
          .get().then(docs => {
    docs.forEach(doc => {
      purchases.push({...doc.data(), id:doc.id})
    })
  })
  return purchases
}

export const getArchivedStockTrans = month => {
  let stockTrans = []
  firebase.firestore().collection('stock-trans')
          .where('isArchived', '==', true)
          .where('archivedMonth', '==', month)
          .get().then(docs => {
    docs.forEach(doc => {
      stockTrans.push({...doc.data(), id:doc.id})
    })
  })
  return stockTrans
}

export const getRequestedPacks = (orders, basket, packs) => {
  const approvedOrders = orders.filter(o => ['a', 'e'].includes(o.status))
  let packsArray = []
  approvedOrders.forEach(o => {
    o.basket.forEach(p => {
      if (['n', 'p'].includes(p.status)) {
        const packInfo = packs.find(pa => pa.id === p.packId)
        const price = p.withBestPrice ? 0 : p.price
        const found = packsArray.findIndex(pa => pa.packId === p.packId && pa.price === price)
        if (!packInfo.byWeight && found > -1) {
          packsArray.splice(found, 1, {
            ...packsArray[found], 
            quantity: addQuantity(packsArray[found].quantity, p.quantity, -1 * p.purchased),
          })
        } else {
          packsArray.push({
            packId: p.packId,
            price, 
            quantity: addQuantity(p.quantity, -1 * p.purchased),
            orderId: o.id,
            packInfo,
            withBestPrice: p.withBestPrice
          })
        }
      }
    })
  })
  packsArray = packsArray.map(p => {
    let inBasket, offerInfo, inBasketQuantity = 0
    if (basket.packs) {
      if (p.packInfo.byWeight) {
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
      if (!p.packInfo.isDivided && addQuantity(p.quantity, -1 * inBasketQuantity) > 0) {
        return {
          ...p,
          quantity: addQuantity(p.quantity, -1 * inBasketQuantity),
        }
      } else {
        return {
          ...p,
          quantity: 0
        }
      }
    } else {
      return p
    }
  })
  packsArray = packsArray.filter(p => p.quantity > 0)
  return packsArray.sort((p1, p2) => p1.packId > p2.packId ? 1 : -1)
}

export const getRequestedPackStores = (pack, basketStockQuantity, packPrices, stores, packs, leastPrice) => {
  let packStores = packPrices.filter(p => (p.packId === pack.id || packs.find(pa => pa.id === p.packId && (pa.subPackId === pack.id || pa.bonusPackId === pack.id))) && (p.storeId !== 's' || addQuantity(p.quantity, -1 * basketStockQuantity) > 0))
  packStores = packStores.map(s => {
    let packId, unitPrice, quantity, offerInfo, isOffer, price, cost = s.cost
    if (s.packId === pack.id) {
      packId = s.packId
      quantity = s.quantity
      isOffer = false
      if (s.cost === s.price || s.storeId === 's') { // for type 5 get total price not unit price
        price = s.price
        unitPrice = s.price
      } else {
        price = s.cost
        unitPrice = s.price
      }
    } else {
      offerInfo = packs.find(p => p.id === s.packId && p.subPackId === pack.id)
      if (offerInfo) {
        packId = offerInfo.id
        if (s.cost === s.price || s.storeId === 's') { // for type 5 get total price not unit price
          unitPrice = Math.trunc((s.price / offerInfo.subQuantity) * offerInfo.subPercent)
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
          unitPrice = Math.trunc((s.price / offerInfo.bonusQuantity) * offerInfo.bonusPercent)
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
      cost,
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
    advert['imageUrl'] = url  
  }
  firebase.firestore().collection('adverts').add(advert)
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
  batch.commit()
}

export const deleteAdvert = advert => {
  firebase.firestore().collection('adverts').doc(advert.id).delete()
}

export const editAdvert = async (advert, image) => {
  const { id, ...others } = advert
  if (image) {
    const filename = image.name
    const ext = filename.slice(filename.lastIndexOf('.'))
    const fileData = await firebase.storage().ref().child('adverts/' + id + ext).put(image)
    const url = await firebase.storage().ref().child(fileData.metadata.fullPath).getDownloadURL()
    others['imageUrl'] = url
  }
  firebase.firestore().collection('adverts').doc(id).update(others)
}

export const mergeOrder = (order, basket, mergedOrderId, batch) => {
  const newBatch =  batch || firebase.firestore().batch()
  const newBasket = order.basket.splice()
  basket.forEach(p => {
    let newItem
    let found = newBasket.findIndex(bp => bp.packId === p.packId)
    if (found === -1) {
      newItem = p
    } else {
      const status = p.status === 'f' ? 'p' : p.status
      const newQuantity = addQuantity(newBasket[found].quantity, p.quantity)
      newItem = {
        ...newBasket[found],
        quantity: newQuantity,
        status,
        gross: status === 'f' ? Math.trunc(p.actual * (p.weight || p.purchased)) : Math.trunc((p.actual || 0) * (p.weight || p.purchased)) + Math.trunc(p.price * addQuantity(newQuantity, -1 * p.purchased)),
      }  
    }
    newBasket.splice(found === -1 ? newBasket.length : found, found === -1 ? 0 : 1, newItem)
  })
  const total = newBasket.reduce((sum, p) => sum + (p.gross || 0), 0)
  const fixedFees = Math.trunc(setup.fixedFees * total)
  const fraction = (total + fixedFees) - Math.floor((total + fixedFees) / 50) * 50
  let orderRef = firebase.firestore().collection('orders').doc(order.id)
  newBatch.update(orderRef, {
    basket: newBasket,
    total,
    fixedFees,
    fraction
  })
  orderRef = firebase.firestore().collection('orders').doc(mergedOrderId)
  newBatch.update(orderRef, {
    status: 'm',
    lastUpdate: new Date()
  })
  if (!batch) {
    newBatch.commit()
  }
} 

export const approveOrderRequest = (order, orders, packPrices, packs) => {
  const batch = firebase.firestore().batch()
  const orderRef = firebase.firestore().collection('orders').doc(order.id)
  if (order.requestType === 'm') {
    const mergedOrder = orders.find(o => o.userId === order.userId && o.status === 's')
    mergeOrder(order, order.requestBasket, mergedOrder?.id || '', batch)
    sendNotification(order.userId, labels.approval, labels.approveMergeRequest, batch)
  } else if (order.requestType === 'c') {
    updateOrderStatus (order, 'i', packPrices, packs, false, batch)
    sendNotification(order.userId, labels.approval, labels.approveCancelRequest, batch)
  } else {
    editOrder (order, order.requestBasket, packPrices, packs, batch)
    sendNotification(order.userId, labels.approval, labels.approveEditRequest, batch)
  }
  batch.update(orderRef, {
    requestStatus: 'a'
  })
  batch.commit()
}

export const confirmReturnBasket = (returnBasket, storeId, orders, stockTrans, packPrices, packs, purchases) => {
  const batch = firebase.firestore().batch()
  if (returnBasket.type === 'r') {
    const purchase = purchases.find(p => p.id === returnBasket.purchaseId)
    let basket = purchase.basket.map(p => {
      const returnedQuantity = returnBasket.packs.find(bp => bp.packId === p.packId && (!bp.weight || bp.weight === p.weight))?.quantity || 0
      return {
        ...p,
        returnedQuantity
      }
    })
    const purchaseRef = firebase.firestore().collection('purchases').doc(purchase.id)
    basket = basket.map(p => {
      return {
        ...p,
        quantity: addQuantity(p.quantity, -1 * p.returnedQuantity)
      }
    })
    basket = basket.filter(p => p.quantity > 0)
    let total
    if (basket.length === 0) {
      batch.delete(purchaseRef)
      total = 0
    } else {
      total = basket.reduce((sum, p) => sum + Math.trunc(p.cost * p.quantity), 0)
      batch.update(purchaseRef, {
        basket,
        total
      })
    }
    const storeRef = firebase.firestore().collection('stores').doc(storeId)
    batch.update(storeRef, {
      balance: firebase.firestore.FieldValue.increment(purchase.total - total)
    }) 
    returnBasket.packs.forEach(p => {
      returnPurchasePack(batch, purchase, p, orders, stockTrans, packPrices, packs)
    })  
  } else {
    addStockTrans(batch, returnBasket, storeId, packPrices, packs)
  }
  batch.commit()
}

export const returnPurchasePack = (batch, purchase, pack, orders, stockTrans, packPrices, packs) => {
  const purchaseQuantity = purchase.basket.find(p => p.packId === pack.packId && (!p.weight || p.weight === pack.weight)).quantity
  if (purchaseQuantity === pack.quantity) {
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
        avgCost = Math.trunc((affectedPack.cost * affectedPack.weight + pack.cost * pack.weight) / newWeight)
        avgActual = Math.trunc((affectedPack.actual * affectedPack.weight + pack.actual * pack.weight) / newWeight)
        newPurchased = addQuantity(affectedPack.purchased, -1 * affectedPack.lastPurchased)
        status = 'p'
      } else {
        newPurchased = addQuantity(affectedPack.purchased, -1 * affectedPack.lastPurchased)
        avgCost = Math.trunc((affectedPack.cost * affectedPack.purchased - pack.cost * affectedPack.lastPurchased) / newPurchased)
        avgActual = Math.trunc((affectedPack.actual * affectedPack.purchased - pack.actual * affectedPack.lastPurchased) / newPurchased)
        status = 'p'
      }
      const newPack = {
        ...affectedPack,
        purchased: newPurchased,
        storeId: affectedPack.prevStoreId,
        cost: avgCost,
        actual: avgActual,
        gross: Math.trunc(avgActual * (newWeight || newPurchased)) + Math.trunc(affectedPack.price * addQuantity(affectedPack.quantity, -1 * newPurchased)),
        status
      }
      if (newWeight) newPack['weight'] = newWeight
      orderBasket.splice(orderPackIndex, 1, newPack)
      const profit = orderBasket.reduce((sum, p) => sum + ['p', 'f', 'pu'].includes(p.status) ? Math.trunc((p.actual - p.cost) * (p.weight || p.purchased)) : 0, 0)
      const total = orderBasket.reduce((sum, p) => sum + (p.gross || 0), 0)
      const fixedFees = Math.trunc(setup.fixedFees * total)  
      const fraction = (total + fixedFees) - Math.floor((total + fixedFees) / 50) * 50
      const orderRef = firebase.firestore().collection('orders').doc(o.id)
      batch.update(orderRef, {
        basket: orderBasket,
        profit,
        total,
        fixedFees,
        fraction,
        status: orderBasket.find(bp => bp.status === 'p') ? 'e' : 'a',
        lastUpdate: new Date()
      })
    })  
  }
  const affectedStockTrans = stockTrans.find(t => t.purchaseId === purchase.id)
  let transBasket, transPackIndex, transTotal
  if (affectedStockTrans) {
    transBasket = affectedStockTrans.basket
    transPackIndex = transBasket.findIndex(p => p.packId === pack.packId)
    const outPack = {
      ...transBasket[transPackIndex],
      quantity: Math.min(pack.quantity, transBasket[transPackIndex].quantity)
    }
    packStockOut(batch, outPack, packPrices, packs)
    const storePackRef = firebase.firestore().collection('stock-trans').doc(affectedStockTrans.id)
    if (pack.quantity >= transBasket[transPackIndex].quantity) {
      if (transBasket.length === 1) {
        batch.delete(storePackRef)
      } else {
        transBasket.splice(transPackIndex, 1)
        transTotal = transBasket.reduce((sum, p) => sum + Math.trunc(p.cost * p.quantity), 0)
        batch.update(storePackRef, {
          basket: transBasket,
          total: transTotal
        })
      }  
    } else {
      transBasket.splice(transPackIndex, 1, {
        ...transBasket[transPackIndex],
        quantity: addQuantity(transBasket[transPackIndex].quantity, -1 * pack.quantity)
      })
      transTotal = transBasket.reduce((sum, p) => sum + Math.trunc(p.cost * p.quantity), 0)
      batch.update(storePackRef, {
        basket: transBasket,
        total: transTotal
      })
    }
  }
}

export const permitUser = async (userId, storeId, users, stores) => {
  const userInfo = users.find(u => u.id === userId)
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
    displayName: storeId
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
  firebase.firestore().collection('logs').doc(log.id).delete()
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
  batch.commit()
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
  firebase.firestore().collection('users').doc(userId).update({
    debitRequestStatus: 'a',
  })
}

export const approveNotifyFriends = (userInfo, pack, users) => {
  const batch = firebase.firestore().batch()
  let userFriends = userInfo.friends?.slice() || []
  userFriends = userFriends.filter(f => f.status === 'r')
  userFriends.forEach(f => {
    const friendInfo = users.find(u => u.mobile === f.mobile)
    if (friendInfo) {
      sendNotification(friendInfo.id, `${labels.notifyFromFriend} ${userInfo.name}`, `${labels.offerAvailableFor} ${pack.productName} ${pack.name}, ${labels.withPrice}: ${(pack.price / 1000).toFixed(3)}`, batch)
    }
  })
  const userRef = firebase.firestore().collection('users').doc(userInfo.id)
  batch.update(userRef, {
    notifyFriends: firebase.firestore.FieldValue.arrayRemove(pack.id)
  })
  batch.commit()
}

export const addStorePayment = (storeId, payment) => {
  firebase.firestore().collection('stores').doc(storeId).update({
    balance: firebase.firestore.FieldValue.increment(['f', 'r'].includes(payment.type) ? -1 * payment.amount : payment.amount),
    payments: firebase.firestore.FieldValue.arrayUnion(payment)
  })
}

export const SetDeliveryTime = (orderId, deliveryTime) => {
  firebase.firestore().collection('orders').doc(orderId).update({
    deliveryTime,
    lastUpdate: new Date()
  })
}