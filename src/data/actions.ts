import firebase, { prodApp } from './firebase'
import labels from './labels'
import { f7 } from 'framework7-react'
import { setup, randomColors } from './config'
import moment from 'moment'

export const getMessage = (path: any, error: any) => {
  const errorCode = error.code ? error.code.replace(/-|\//g, '_') : error.message
  if (!labels[errorCode]) {
    firebase.firestore().collection('logs').add({
      userId: firebase.auth().currentUser?.uid,
      error: error.code,
      page: path,
      time: new Date()
    })
  }
  return labels[errorCode] || labels['unknownError']
}

export const showMessage = (messageText: any) => {
  const message = f7.toast.create({
    text: `<span class="success">${messageText}<span>`,
    closeTimeout: 3000,
  })
  message.open()
}

export const showError = (messageText: any) => {
  const message = f7.toast.create({
    text: `<span class="error">${messageText}<span>`,
    closeTimeout: 3000,
  })
  message.open()
}

export const quantityText = (quantity: any, weight?: any): any => {
  return weight && weight !== quantity ? `${quantityText(quantity)}(${quantityText(weight)})` : quantity === Math.trunc(quantity) ? quantity.toString() : quantity.toFixed(3)
}

export const quantityDetails = (basketPack: any) => {
  let text = `${labels.requested}: ${quantityText(basketPack.quantity)}`
  if (basketPack.purchased > 0) {
    text += `, ${labels.purchased}: ${quantityText(basketPack.purchased, basketPack.weight)}`
  }
  if (basketPack.returned > 0) {
    text += `, ${labels.returned}: ${quantityText(basketPack.returned)}`
  }
  return text
}

export const addQuantity = (q1: any, q2: any, q3 = 0) => {
  return Math.trunc(q1 * 1000 + q2 * 1000 + q3 * 1000) / 1000
  }

export const productOfText = (trademark: any, country: any) => {
  return trademark ? `${labels.productFrom} ${trademark}-${country}` : `${labels.productOf} ${country}`
}

export const login = (email: any, password: any) => {
  return firebase.auth().signInWithEmailAndPassword(email, password)
}

export const logout = () => {
  firebase.auth().signOut()
}

export const updateOrder = (batch: any, storeId: any, order: any, basketPack: any, purchaseId?: any) => {
  const basket = order.basket.slice()
  const orderPackIndex = basket.findIndex((p: any) => p.packId === basketPack.packId)
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
  const avgCost = orderPackQuantity === 0 ? basketPack.cost : Math.round((orderPack.cost * orderPackQuantity + basketPack.cost * basketPack.weight) / newWeight)
  const avgActual = orderPackQuantity === 0 ? actual : Math.round((orderPack.actual * orderPackQuantity + basketPack.actual * basketPack.weight) / newWeight)
  let status = basketPack.isDivided ? 'f' : (orderPack.quantity === addQuantity(orderPack.purchased, basketPack.quantity) ? 'f' : 'p')
  const gross = status === 'f' ? Math.round(avgActual * newWeight) : Math.round(avgActual * newWeight) + Math.round(orderPack.price * addQuantity(orderPack.quantity, -1 * newPurchased))
  basket.splice(orderPackIndex, 1, {
    ...orderPack,
    purchased: newPurchased,
    storeId: orderPack.storeId && orderPack.storeId !== storeId ? 'm' : storeId,
    cost: avgCost,
    actual: avgActual,
    gross,
    weight: newWeight,
    status,
    lastPurchaseId: purchaseId || '',
    lastPurchased: basketPack.quantity,
    lastWeight: basketPack.weight,
    prevStoreId: orderPack.storeId || ''
  })
  if (basket.length === basket.filter((p: any) => ['f', 'u', 'pu'].includes(p.status)).length) {
    orderStatus = 'f'
  }
  const profit = basket.reduce((sum: any, p: any) => sum + ['p', 'f', 'pu'].includes(p.status) ? Math.round((p.actual - p.cost) * (p.weight || p.purchased)) : 0, 0)
  const total = basket.reduce((sum: any, p: any) => sum + (p.gross || 0), 0)
  const fixedFees = Math.round(setup.fixedFees * total)
  const fraction = (total + fixedFees) - Math.floor((total + fixedFees) / 5) * 5
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

export const updateOrders = (batch: any, storeId: any, orders: any, basketPack: any, purchaseId?: any) => {
  let remaining = basketPack.quantity
  let orderPack, orderPackIndex, purchased, orderStatus, avgCost, avgActual, status
  let basket, profit, total, fixedFees, fraction, orderRef, actual, gross
  for (let o of orders){
    if (remaining <= 0) break
    basket = o.basket.slice()
    orderPackIndex = basket.findIndex((p: any) => p.packId === basketPack.packId)
    orderPack = basket[orderPackIndex]
    if (orderPack.price < basketPack.actual && basketPack.exceedPriceType === 'o') {
      actual = orderPack.price
    } else {
      actual = basketPack.actual
    }
    orderStatus = 'e'
    if (remaining >= addQuantity(orderPack.quantity, -1 * orderPack.purchased)) {
      purchased = addQuantity(orderPack.quantity, -1 * orderPack.purchased)
    } else {
      purchased = remaining
    }
    avgCost = orderPack.purchased === 0 ? basketPack.cost : Math.round((orderPack.cost * orderPack.purchased + basketPack.cost * purchased) / addQuantity(orderPack.purchased, purchased))
    avgActual = orderPack.purchased === 0 ? actual : Math.round((orderPack.actual * orderPack.purchased + actual * purchased) / addQuantity(orderPack.purchased, purchased))
    status = orderPack.quantity === addQuantity(orderPack.purchased, purchased) ? 'f' : 'p'
    gross = status === 'f' ? Math.round(avgActual * addQuantity(orderPack.purchased, purchased)) : Math.round(avgActual * addQuantity(orderPack.purchased, purchased)) + Math.round(orderPack.price * addQuantity(orderPack.quantity, -1 * orderPack.purchased, -1 * purchased))
    basket.splice(orderPackIndex, 1, {
      ...orderPack, 
      purchased: addQuantity(orderPack.purchased, purchased),
      storeId: orderPack.storeId && orderPack.storeId !== storeId ? 'm' : storeId,
      cost: avgCost,
      actual: avgActual,
      gross,
      status,
      lastPurchaseId: purchaseId || '',
      lastPurchased: purchased,
      prevStoreId: orderPack.storeId || ''
    })
    if (basket.length === basket.filter((p: any) => ['f', 'u', 'pu'].includes(p.status)).length) {
      orderStatus = 'f'
    }
    profit = basket.reduce((sum: any, p: any) => sum + ['p', 'f', 'pu'].includes(p.status) ? Math.round((p.actual - p.cost) * (p.weight || p.purchased)) : 0, 0)
    total = basket.reduce((sum: any, p: any) => sum + (p.gross || 0), 0)
    fixedFees = Math.round(setup.fixedFees * total)  
    fraction = (total + fixedFees) - Math.floor((total + fixedFees) / 5) * 5
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

export const updateOrderStatus = (order: any, type: any, packPrices: any, packs: any, blockUserFlag: any, batch?: any) => {
  const newBatch = batch || firebase.firestore().batch()
  const orderRef = firebase.firestore().collection('orders').doc(order.id)
  newBatch.update(orderRef, {
    status: type,
    lastUpdate: new Date(),
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
    basket = order.basket.filter((p: any) => p.purchased > 0)
    basket = basket.map((p: any) => {
      return {
        ...p,
        quantity: p.purchased
      }
    })
    if (blockUserFlag) {
      customerRef = firebase.firestore().collection('customers').doc(order.userId)
      newBatch.update(customerRef, {
        isBlocked: true
      })
      sendNotification(order.userId, labels.notice, labels.customerHasBeenBlocked, newBatch)
    }
  } else if (type === 'd'){
    basket = order.basket.filter((p: any) => p.returned > 0)
    if (basket.length > 0) {
      basket = basket.map((p: any) => {
        return {
          ...p,
          quantity: p.returned
        }
      })
    }
    order.basket.forEach((p: any) => {
      const packInfo = packs.find((pa: any) => pa.id === p.packId)
      const productRef = firebase.firestore().collection('products').doc(packInfo.productId)
      newBatch.update(productRef, {
        sales: firebase.firestore.FieldValue.increment(p.purchased)
      })
      const affectedPacks = packs.filter((pa: any) => pa.productId === packInfo.productId)
      affectedPacks.forEach((pa: any) => {
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

export const confirmPurchase = (basket: any, orders: any, storeId: any, packPrices: any, packs: any, stores: any, total: any) => {
  const batch = firebase.firestore().batch()
  const purchaseRef = firebase.firestore().collection('purchases').doc()
  const packBasket = basket.map((p: any) => {
    let newPack: any = {
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
  updateStoreBalance(batch, storeId, total, new Date(), stores)
  let packsIn: any = []
  const approvedOrders = orders.filter((o: any) => ['a', 'e'].includes(o.status))
  basket.forEach((p: any) => {
    let packOrders, remaining, packInfo: any, quantity, mainRemaining, subPack: any, pack = p
    packInfo = packs.find((pa: any) => pa.id === p.packId)
    if (p.weight) {
      if (p.orderId) {
        const order = orders.find((o: any) => o.id === p.orderId)
        updateOrder(batch, storeId, order, p, purchaseRef.id)
      } else {
        packsIn.push(p)
      }
    } else {
      if (!packInfo.forSale) {
        packInfo = packs.find((pa: any) => pa.id === packInfo.subPackId)
        pack = {
          packId: packInfo.id,
          quantity: p.quantity * packInfo.subQuantity,
          cost: Math.round(p.cost / packInfo.subQuantity * packInfo.subPercent),
          actual: Math.round(p.actual / packInfo.subQuantity * packInfo.subPercent),
          exceedPriceType: p.exceedPriceType
        }
      }
      packOrders = approvedOrders.filter((o: any) => o.basket.find((op: any) => op.packId === pack.packId && op.price === p.price && ['n', 'p'].includes(op.status)))
      packOrders.sort((o1: any, o2: any) => o1.time.seconds - o2.time.seconds)
      remaining = updateOrders(batch, storeId, packOrders, pack, purchaseRef.id)
      if (remaining > 0) {
        mainRemaining = remaining
        if (packInfo.subPackId) {
          subPack = {
            packId: packInfo.subPackId,
            quantity: remaining * packInfo.subQuantity,
            cost: Math.round(pack.cost / packInfo.subQuantity * packInfo.subPercent),
            actual: Math.round(pack.actual / packInfo.subQuantity * packInfo.subPercent * (1 + setup.profit)),
            exceedPriceType: pack.exceedPriceType
          }
          packOrders = approvedOrders.filter((o: any) => o.basket.find((op: any) => op.packId === subPack.packId && op.price === p.price && ['n', 'p'].includes(op.status)))
          packOrders.sort((o1: any, o2: any) => o1.time.seconds - o2.time.seconds)
          quantity = updateOrders(batch, storeId, packOrders, subPack, purchaseRef.id)
          if (quantity > 0) {
            mainRemaining = Math.min(mainRemaining, Math.trunc(quantity / packInfo.subQuantity))
            quantity = quantity % packInfo.subQuantity
            if (quantity > 0) {
              packsIn.push({...subPack, quantity})
            }
          }
          if (packInfo.bonusPackId){
            subPack = {
              packId: packInfo.bonusPackId,
              quantity: remaining * packInfo.bonusQuantity,
              cost: Math.round(p.cost / packInfo.bonusQuantity * packInfo.bonusPercent),
              actual: Math.round(p.actual / packInfo.bonusQuantity * packInfo.bonusPercent * (1 + setup.profit)),
              exceedPriceType: p.exceedPriceType
            }
            packOrders = approvedOrders.filter((o: any) => o.basket.find((op: any) => op.packId === subPack.packId && op.price === p.price && ['n', 'p'].includes(op.status)))
            packOrders.sort((o1: any, o2: any) => o1.time.seconds - o2.time.seconds)
            quantity = updateOrders(batch, storeId, packOrders, subPack, purchaseRef.id)
            if (quantity > 0) {
              mainRemaining = Math.min(mainRemaining, Math.trunc(quantity / packInfo.subQuantity))
              quantity = quantity % packInfo.subQuantity
              if (quantity > 0) {
                packsIn.push({...subPack, quantity})
              }
            }
          }
        }
        if (mainRemaining > 0) {
          packsIn.push({...pack, quantity: mainRemaining})
        }
      }
    }  
  })
  batch.commit()
}

export const updateStoreBalance = (batch: any, storeId: any, amount: any, date: any, stores: any) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const store = stores.find((s: any) => s.id === storeId)
  const balances = store.balances?.slice() || []
  const monthIndex = balances.findIndex((b: any) => b.month === year * 100 + month)
  const monthBalance = {
    month: year * 100 + month,
    balance: monthIndex === -1 ? amount : balances[monthIndex].balance + amount
  }
  balances.splice(monthIndex === -1 ? balances.length : monthIndex, 1, monthBalance)
  const storeRef = firebase.firestore().collection('stores').doc(storeId)
  batch.update(storeRef, {
    balances
  })
}

export const addPackPrice = (storePack: any, packPrices: any, packs: any, batch?: any) => {
  const newBatch = batch || firebase.firestore().batch()
  const { packId, ...others } = storePack
  const pack = packs.find((p: any) => p.id === packId)
  let packRef = firebase.firestore().collection('packs').doc(pack.id)
  newBatch.update(packRef, {
    prices: firebase.firestore.FieldValue.arrayUnion(others)
  })
  if (storePack.isActive && pack.forSale && (storePack.price <= pack.price || pack.price === 0)) {
    const { minPrice, minStoreId, weightedPrice, offerEnd } = getMinPrice(storePack, pack, packPrices, false)
    packRef = firebase.firestore().collection('packs').doc(pack.id)
    newBatch.update(packRef, {
      price: minPrice,
      weightedPrice,
      offerEnd,
      minStoreId
    })
  }
  if (!pack.forSale) {
    let subStorePack = packPrices.find((p: any) => p.storeId === storePack.storeId && p.packId === pack.subPackId)
    if (!subStorePack) {
      const subStorePack = {
        packId: pack.subPackId,
        storeId: storePack.storeId,
        cost: Math.round(storePack.cost / pack.subQuantity),
        price: Math.round(storePack.price / pack.subQuantity),
        offerEnd: storePack.offerEnd,
        isActive: storePack.isActive,
        isAuto: true,
        time: new Date()
      }
      addPackPrice(subStorePack, packPrices, packs, batch)  
    }
  }
  if (!batch) {
    newBatch.commit()
  }
}

export const addProduct = async (product: any, image: any) => {
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

export const deleteProduct = async (product: any) => {
  if (product.imageUrl) {
    try{
      await firebase.storage().ref().child('products/' + product.id + '.jpg').delete()
    } catch {
      await firebase.storage().ref().child('products/' + product.id + '.jpeg').delete()
    }  
  }
  firebase.firestore().collection('products').doc(product.id).delete()
}

export const editProduct = async (product: any, oldName: any, image: any, packs: any) => {
  const batch = firebase.firestore().batch()
  const { id, ...others } = product
  let imageUrl: any
  if (image) {
    const filename = image.name
    const ext = filename.slice(filename.lastIndexOf('.'))
    const fileData = await firebase.storage().ref().child('products/' + id + ext).put(image)
    imageUrl = await firebase.storage().ref().child(fileData.metadata.fullPath).getDownloadURL()
    others['imageUrl'] = imageUrl
  }
  const productRef = firebase.firestore().collection('products').doc(id)
  batch.update(productRef, others)
  let affectedPacks = packs.filter((p: any) => p.productId === id)
  affectedPacks.forEach((p: any) => {
    const packRef = firebase.firestore().collection('packs').doc(p.id)
    const packInfo: any = {
      productName: product.name,
      productEname: product.ename,
      productDescription: product.description,
      categoryId: product.categoryId,
      country: product.country,
      trademark: product.trademark,
      sales: product.sales,
      rating: product.rating,
      ratingCount: product.ratingCount
    }
    if (image && ((!p.subPackId && !p.specialImage) || (p.subPackId && !p.specialImage && packs.find((sp: any) => sp.id === p.subPackId).specialImage === false))) {
      packInfo['imageUrl'] = imageUrl
    }
    batch.update(packRef, packInfo)
  })
  if (product.name !== oldName) {
    affectedPacks = packs.filter((p: any) => packs.find((bp: any) => bp.id === p.bonusPackId && bp.productId === id))
    affectedPacks.forEach((p: any) => {
      const packRef = firebase.firestore().collection('packs').doc(p.id)
      batch.update(packRef, {
        bonusProductName: product.name,
      })
    })
  }
  batch.commit()
}

export const editPrice = (storePack: any, oldPrice: any, packPrices: any, packs: any, batch?: any) => {
  const newBatch = batch || firebase.firestore().batch()
  const { packId, ...others } = storePack
  const pack = packs.find((p: any) => p.id === packId)
  const prices = pack.prices.slice()
  const storeIndex = prices.findIndex((p: any) => p.storeId === storePack.storeId)
  prices.splice(storeIndex, 1, others)
  let packRef = firebase.firestore().collection('packs').doc(packId)
  newBatch.update(packRef, {
    prices
  })
  if (storePack.isActive && pack.forSale && (storePack.price <= pack.price || pack.price === 0 || pack.price === oldPrice)) {
    const { minPrice, minStoreId, weightedPrice, offerEnd } = getMinPrice(storePack, pack, packPrices, false)
    packRef = firebase.firestore().collection('packs').doc(pack.id)
    newBatch.update(packRef, {
      price: minPrice,
      weightedPrice,
      offerEnd,
      minStoreId
    })
  }
  if (!pack.forSale) { 
    let subStorePack = packPrices.find((p: any) => p.storeId === storePack.storeId && p.packId === pack.subPackId)
    if (subStorePack) {
      const subStorePackOldPrice = subStorePack.price
      subStorePack = {
        ...subStorePack,
        cost: Math.round(storePack.cost / pack.subQuantity),
        price: Math.round(storePack.price / pack.subQuantity),
      }
      editPrice(subStorePack, subStorePackOldPrice, packPrices, packs, newBatch)
    }
  } 
  if (!batch) {
    newBatch.commit()
  }
}

export const changeStorePackStatus = (storePack: any, packPrices: any, packs: any, batch?: any) => {
  const newBatch = batch || firebase.firestore().batch()
  const { packId, ...others } = storePack
  const pack = packs.find((p: any) => p.id === packId)
  const prices = pack.prices.slice()
  const storeIndex = prices.findIndex((p: any) => p.storeId === storePack.storeId)
  const newStorePack = {
    ...others,
    isActive: !storePack.isActive
  }
  prices.splice(storeIndex, 1, newStorePack)
  let packRef = firebase.firestore().collection('packs').doc(packId)
  newBatch.update(packRef, {
    prices
  })
  let actionType
  if (storePack.isActive && storePack.price === pack.price) {
    actionType = 'd'
  } else if (newStorePack.isActive && pack.forSale && (newStorePack.price <= pack.price || pack.price === 0)) {
    actionType = 'a'
  }
  if (actionType) {
    const { minPrice, minStoreId, weightedPrice, offerEnd } = getMinPrice(actionType === 'd' ? storePack : newStorePack, pack, packPrices, actionType === 'd' ? true : false)    
    packRef = firebase.firestore().collection('packs').doc(pack.id)
    newBatch.update(packRef, {
      price: minPrice,
      weightedPrice,
      offerEnd,
      minStoreId
    })
  }
  if (!pack.forSale) { 
    const subStorePack = packPrices.find((p: any) => p.storeId === storePack.storeId && p.packId === pack.subPackId)
    if (subStorePack) {
      changeStorePackStatus(subStorePack, packPrices, packs, newBatch)
    }
  }
  if (!batch) {
    newBatch.commit()
  }
}

const getMinPrice = (storePack: any, pack: any, packPrices: any, isDeletion: any) => {
  const packStores = packPrices.filter((p: any) => p.packId === pack.id && p.storeId !== storePack.storeId && p.price > 0 && p.isActive)
  if (!isDeletion && storePack.isActive){
    packStores.push(storePack)
  }
  let minPrice: any, weightedPrice, offerEnd, minStoreId = ''
  if (packStores.length === 0){
    minPrice = 0
    weightedPrice = 0
    offerEnd = ''
  } else {
    const prices = packStores.map((s: any) => s.price)
    minPrice = Math.min(...prices)
    weightedPrice = Math.round(minPrice / pack.unitsCount)
    // packStores.sort((p1: any, p2: any) => (moment(p2.offerEnd) || moment().add(1000, 'days')) - (p1.offerEnd ? moment(p1.offerEnd) : moment().add(1000, 'days')))
    offerEnd = packStores.find((s: any) => s.price === minPrice).offerEnd
    if (packStores.filter((s: any) => s.price === minPrice).length === 1) {
      minStoreId = packStores.find((s: any) => s.price === minPrice).storeId
    }
  }
  return {minPrice, minStoreId, weightedPrice, offerEnd}
}

export const refreshPackPrice = (pack: any, packPrices: any) => {
  let packStores = packPrices.filter((p: any) => p.packId === pack.id && p.price > 0 && p.isActive)
  let minPrice: any, weightedPrice, offerEnd, minStoreId = ''
  if (packStores.length === 0){
    minPrice = 0
    weightedPrice = 0
    offerEnd = ''
  } else {
    const prices = packStores.map((s: any) => s.price)
    minPrice = Math.min(...prices)
    weightedPrice = Math.round(minPrice / pack.unitsCount)
    // packStores.sort((p1: any, p2: any) => (p2.offerEnd ? moment(p2.offerEnd) : moment().add(1000, 'days')) - (p1.offerEnd ? moment(p1.offerEnd) : moment().add(1000, 'days')))
    offerEnd = packStores.find((s: any) => s.price === minPrice).offerEnd
    if (packStores.filter((s: any) => s.price === minPrice).length === 1) {
      minStoreId = packStores.find((s: any) => s.price === minPrice).storeId
    }
  }  
  firebase.firestore().collection('packs').doc(pack.id).update({
    price: minPrice,
    weightedPrice,
    offerEnd,
    minStoreId
  })
}

export const deleteStorePack = (storePack: any, packPrices: any, packs: any, batch?: any) => {
  const newBatch = batch || firebase.firestore().batch()
  const pack = packs.find((p: any) => p.id === storePack.packId)
  const prices = pack.prices.slice()
  const storeIndex = prices.findIndex((p: any) => p.storeId === storePack.storeId)
  prices.splice(storeIndex, 1)
  let packRef = firebase.firestore().collection('packs').doc(pack.id)
  newBatch.update(packRef, {
    prices
  })
  if (storePack.price === pack.price) {
    const { minPrice, minStoreId, weightedPrice, offerEnd } = getMinPrice(storePack, pack, packPrices, true)
    packRef = firebase.firestore().collection('packs').doc(pack.id)
    newBatch.update(packRef, {
      price: minPrice,
      weightedPrice,
      offerEnd,
      minStoreId
    })
  }
  if (!pack.forSale) {
    const subStorePack = packPrices.find((p: any) => p.storeId === storePack.storeId && p.packId === pack.subPackId)
    if (subStorePack) {
      deleteStorePack(subStorePack, packPrices, packs, newBatch)
    }
  } 
  if (!batch) {
    newBatch.commit()
  }
}

export const addStore = (store: any) => {
  firebase.firestore().collection('stores').add(store)
}

export const editStore = (store: any) => {
  const { id, ...others } = store
  firebase.firestore().collection('stores').doc(id).update(others)
}

export const addCountry = (country: any) => {
  firebase.firestore().collection('lookups').doc('c').set({
    values: firebase.firestore.FieldValue.arrayUnion(country)
  }, {merge: true})
}

export const deleteCountry = (countryId: any, countries: any) => {
  const values = countries.slice()
  const countryIndex = values.findIndex((c: any) => c.id === countryId)
  values.splice(countryIndex, 1)
  firebase.firestore().collection('lookups').doc('c').update({
    values
  })
}

export const editCountry = (country: any, countries: any) => {
  const values = countries.slice()
  const countryIndex = values.findIndex((c: any) => c.id === country.id)
  values.splice(countryIndex, 1, country)
  firebase.firestore().collection('lookups').doc('c').update({
    values
  })
}

export const addPackType = (packType: any) => {
  firebase.firestore().collection('lookups').doc('p').set({
    values: firebase.firestore.FieldValue.arrayUnion(packType)
  }, {merge: true})
}

export const editPackType = (packType: any, packTypes: any) => {
  const values = packTypes.slice()
  const packTypeIndex = values.findIndex((t: any) => t.id === packType.id)
  values.splice(packTypeIndex, 1, packType)
  firebase.firestore().collection('lookups').doc('p').update({
    values
  })
}

export const deletePackType = (packTypeId: any, packTypes: any) => {
  const values = packTypes.slice()
  const packTypeIndex = values.findIndex((t: any) => t.id === packTypeId)
  values.splice(packTypeIndex, 1)
  firebase.firestore().collection('lookups').doc('p').update({
    values
  })
}

export const addLocation = (location: any) => {
  firebase.firestore().collection('lookups').doc('l').set({
    values: firebase.firestore.FieldValue.arrayUnion(location)
  }, {merge: true})
}

export const editLocation = (location: any, locations: any) => {
  const values = locations.slice()
  const locationIndex = values.findIndex((l: any) => l.id === location.id)
  values.splice(locationIndex, 1, location)
  firebase.firestore().collection('lookups').doc('l').update({
    values
  })
}

export const addTrademark = (trademark: any) => {
  firebase.firestore().collection('lookups').doc('t').set({
    values: firebase.firestore.FieldValue.arrayUnion(trademark)
  }, {merge: true})
}

export const editTrademark = (trademark: any, trademarks: any) => {
  const values = trademarks.slice()
  const trademarkIndex = values.findIndex((t: any) => t.id === trademark.id)
  values.splice(trademarkIndex, 1, trademark)
  firebase.firestore().collection('lookups').doc('t').update({
    values
  })
}

export const deleteTrademark = (trademarkId: any, trademarks: any) => {
  const values = trademarks.slice()
  const trademarkIndex = values.findIndex((t: any) => t.id === trademarkId)
  values.splice(trademarkIndex, 1)
  firebase.firestore().collection('lookups').doc('t').update({
    values
  })
}

export const addCategory = (parentId: any, name: any, ename: any, ordering: any) => {
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
    ename,
    ordering,
    isLeaf: true,
    isActive: false
  })
  batch.commit()
}

export const editCategory = (category: any, oldCategory: any, categories: any) => {
  const batch = firebase.firestore().batch()
  const { id, ...others } = category
  let categoryRef = firebase.firestore().collection('categories').doc(id)
  batch.update(categoryRef, others)
  if (category.parentId !== oldCategory.parentId) {
    categoryRef = firebase.firestore().collection('categories').doc(category.parentId)
    batch.update(categoryRef, {
      isLeaf: false
    })
    const childrenCount = categories.filter((c: any) => c.id !== id && c.parentId === oldCategory.parentId)
    if (childrenCount === 0) {
      categoryRef = firebase.firestore().collection('categories').doc(oldCategory.parentId)
      batch.update(categoryRef, {
        isLeaf: true
      })  
    }
  }
  batch.commit()
}

export const deleteCategory = (category: any, categories: any) => {
  const batch = firebase.firestore().batch()
  let categoryRef: any = firebase.firestore().collection('categories').doc(category.id).delete()
  const childrenCount = categories.filter((c: any) => c.id !== category.id && c.parentId === category.parentId)
  if (childrenCount === 0) {
    categoryRef = firebase.firestore().collection('categories').doc(category.parentId)
    batch.update(categoryRef, {
      isLeaf: true
    })
  }
  batch.commit()
}

export const getCategoryName = (category: any, categories: any): any => {
  if (category.parentId === '0') {
    return category.name
  } else {
    const categoryParent = categories.find((c: any) => c.id === category.parentId)
    return getCategoryName(categoryParent, categories) + '-' + category.name
  }
}

export const resolvePasswordRequest = (requestId: any) => {
  firebase.firestore().collection('password-requests').doc(requestId).delete()
}

export const addPack = async (pack: any, product: any, image: any, subPackInfo?: any) => {
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

export const deletePack = (packId: any) => {
  firebase.firestore().collection('packs').doc(packId).delete()
}

export const editPack = async (newPack: any, oldPack: any, image: any, packs: any) => {
  const batch = firebase.firestore().batch()
  const { id, ...others } = newPack
  let imageUrl: any
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
  let affectedPacks = packs.filter((p: any) => p.subPackId === id)
  affectedPacks.forEach((p: any) => {
    const packRef = firebase.firestore().collection('packs').doc(p.id)
    const packInfo: any = {
      subPackName: newPack.name,
      unitsCount: p.subQuantity * newPack.unitsCount,
      isDivided: newPack.isDivided,
      byWeight: newPack.byWeight,
      closeExpired: newPack.closeExpired
    }
    if (image && !p.specialImage) {
      packInfo['imageUrl'] = imageUrl
    }
    batch.update(packRef, packInfo)
  })
  if (newPack.name !== oldPack.name) {
    affectedPacks = packs.filter((p: any) => p.bonusPackId === id)
    affectedPacks.forEach((p: any) => {
      const packRef = firebase.firestore().collection('packs').doc(p.id)
      batch.update(packRef, {
        bonusPackName: newPack.name
      })
    })
  }
  batch.commit()
}

export const editCustomer = (customer: any, name: any, locationId: any, mobile: any, storeId: any, stores: any) => {
  const batch = firebase.firestore().batch()
  const { id, ...others } = customer
  const customerRef = firebase.firestore().collection('customers').doc(id)
  const storeName = storeId ? `-${stores.find((s: any) => s.id === storeId).name}`: ''
  batch.update(customerRef, {
    ...others,
    name: `${name}${storeName}:${mobile}`,
  })
  const userRef = firebase.firestore().collection('users').doc(id)
  batch.update(userRef, {
    name,
    locationId
  })
  batch.commit()
}

export const approveUser = (id: any, name: any, mobile: any, locationId: any, storeId: any, users: any) => {
  const batch = firebase.firestore().batch()
  const customerRef = firebase.firestore().collection('customers').doc(id)
  batch.set(customerRef, {
    name: `${name}:${mobile}`,
    orderLimit: 0,
    isBlocked: false,
    storeId,
    deliveryFees: 0,
    specialDiscount: 0,
    discounts: 0,
    mapPosition: '',
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
  const invitedBy = users.filter((u: any) => u.friends?.find((f: any) => f.mobile === mobile))
  invitedBy.forEach((u: any) => {
    const friends = u.friends.slice()
    const invitationIndex = friends.findIndex((f: any) => f.mobile === mobile)
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

export const deleteUser = async (user: any, orders: any) => {
  const colors = user.colors.map((c: any) => randomColors.find(rc => rc.name === c)?.id)
  const password = colors.join('')
  await firebase.firestore().collection('users').doc(user.id).delete()
  const userOrders = orders.filter((o: any) => o.userId === user.id)
  for (let o of userOrders) {
    await firebase.firestore().collection('orders').doc(o.id).delete()
  }
  await firebase.auth().signInWithEmailAndPassword(user.mobile + '@gmail.com', user.mobile.substring(9, 2) + password)
  return firebase.auth().currentUser?.delete()
}

export const approveAlarm = (user: any, alarm: any, newPackId: any, customer: any, packPrices: any, packs: any) => {
  const batch = firebase.firestore().batch()
  const alarms = user.alarms.slice()
  const alarmIndex = alarms.findIndex((a: any) => a.id === alarm.id)
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
  const storePack = packPrices.find((p: any) => p.storeId === customer.storeId && p.packId === (newPackId || alarm.packId))
  let offerEnd
  if (alarm.offerDays) {
    offerEnd = alarm.time.toDate()
    offerEnd.setDate(offerEnd.getDate() + alarm.offerDays)
  }
  const newStorePack = { 
    packId: newPackId || alarm.packId, 
    storeId: customer.storeId,
    cost: alarm.price,
    price: alarm.price,
    offerEnd,
    isActive: true,
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

export const packUnavailable = (pack: any, packPrice: any, orders: any, overPriced: any) => {
  const batch = firebase.firestore().batch()
  const packOrders = orders.filter((o: any) => o.basket.find((p: any) => p.packId === pack.id && p.price === packPrice && ['n', 'p'].includes(p.status)))
  packOrders.forEach((o: any) => {
    const basket = o.basket.slice()
    const orderPackIndex = basket.findIndex((p: any) => p.packId === pack.id)
    let orderStatus = 'e'
    basket.splice(orderPackIndex, 1, {
      ...basket[orderPackIndex],
      status: basket[orderPackIndex].purchased > 0 ? 'pu' : 'u',
      gross: Math.round((basket[orderPackIndex].actual || 0) * (basket[orderPackIndex].weight || basket[orderPackIndex].purchased)),
      overPriced
    })
    if (basket.length === basket.filter((p: any) => p.status === 'u').length) {
      orderStatus = 'u'
    } else if (basket.length === basket.filter((p: any) => ['f', 'u', 'pu'].includes(p.status)).length) {
      orderStatus = 'f'
    }
    const total = basket.reduce((sum: any, p: any) => sum + (p.gross || 0), 0)
    let fixedFees, fraction, profit
    let discount = o.discount
    if (total === 0) {
      fixedFees = 0
      fraction = 0
      profit = 0
      discount.value = 0
      discount.type = 'n'
    } else {
      profit = basket.reduce((sum: any, p: any) => sum + ['p', 'f', 'pu'].includes(p.status) ? Math.round((p.actual - p.cost) * (p.weight || p.purchased)) : 0, 0)
      fixedFees = Math.round(setup.fixedFees * total)
      fraction = (total + fixedFees) - Math.floor((total + fixedFees) / 5) * 5
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

export const addMonthlyTrans = (trans: any, orders: any) => {
  const batch = firebase.firestore().batch()
  const transRef = firebase.firestore().collection('monthly-trans').doc(trans.id)
  batch.set(transRef, trans)
  const month = (Number(trans.id) % 100) - 1
  const year = Math.trunc(Number(trans.id) / 100)
  const ordersToArchived = orders.filter((o: any) => ['s', 'r', 'd', 'c', 'm', 'u', 'i'].includes(o.status) && (o.time.toDate()).getFullYear() === year && (o.time.toDate()).getMonth() === month)
  ordersToArchived.forEach((o: any) => {
    const orderRef = firebase.firestore().collection('orders').doc(o.id)
    batch.update(orderRef, {
      isArchived: true,
      archivedMonth: trans.id
    })
  })
  batch.commit()
}

export const editOrder = (order: any, basket: any, packPrices: any, packs: any, batch?: any) => {
  const newBatch = batch || firebase.firestore().batch()
  let returnBasket = basket.filter((p: any) => p.quantity < p.purchased)
  if (returnBasket.length > 0){
    returnBasket = returnBasket.map((p: any) => {
      return {
        ...p,
        quantity: addQuantity(p.purchased, p.quantity)
      }
    })
  }
  let packBasket = basket.filter((p: any) => p.quantity > 0)
  packBasket = packBasket.map((p: any) => {
    const status = p.quantity === p.purchased ? 'f' : p.purchased > 0 ? 'p' : 'n'
    return {
      ...p,
      purchased: Math.min(p.quantity, p.purchased),
      status,
      gross: status === 'f' ? Math.round(p.actual * (p.weight || p.purchased)) : Math.round((p.actual || 0) * (p.weight || p.purchased)) + Math.round(p.price * addQuantity(p.quantity, -1 * p.purchased)),
    }
  })
  const profit = packBasket.reduce((sum: any, p: any) => sum + ['p', 'f', 'pu'].includes(p.status) ? Math.round((p.actual - p.cost) * (p.weight || p.purchased)) : 0, 0)
  const total = packBasket.reduce((sum: any, p: any) => sum + (p.gross || 0), 0)
  const fixedFees = Math.round(setup.fixedFees * total)
  const fraction = (total + fixedFees) - Math.floor((total + fixedFees) / 5) * 5
  let orderStatus = order.status
  if (packBasket.length === 0){
    if (returnBasket.length === 0){
      orderStatus = 'c'
    } else {
      orderStatus = 'i'
    }
  } else if (packBasket.length === packBasket.filter((p: any) => p.status === 'f').length){
    orderStatus = 'f'
  } else if (packBasket.filter((p: any) => p.purchased > 0).length > 0) {
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

export const changePassword = async (oldPassword: any, newPassword: any) => {
  let user = firebase.auth().currentUser
  if (!user) return
  const email = user.email
  if (!email) return
  await firebase.auth().signInWithEmailAndPassword(email, oldPassword)
  user = firebase.auth().currentUser!
  return user.updatePassword(newPassword)
}

export const approveRating = (rating: any, packs: any) => {
  const batch = firebase.firestore().batch()
  const ratings = rating.userInfo.ratings.slice()
  const ratingIndex = ratings.findIndex((r: any) => r.productId === rating.productInfo.id)
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
  const newRating = Math.round((oldRating * ratingCount + rating.value) / (ratingCount + 1))
  const productRef = firebase.firestore().collection('products').doc(rating.productInfo.id)
  batch.update(productRef, {
    rating: newRating,
    ratingCount: ratingCount + 1
  })
  const affectedPacks = packs.filter((p: any) => p.productId === rating.productInfo.id)
  affectedPacks.forEach((p: any) => {
    const packRef = firebase.firestore().collection('packs').doc(p.id)
    batch.update(packRef, {
      rating: newRating,
      ratingCount: ratingCount + 1
    })
  })
  batch.commit()
}

export const returnOrder = (order: any, orderBasket: any, locationFees: any, packPrices: any, packs: any) => {
  const batch = firebase.firestore().batch()
  const returnBasket = orderBasket.filter((p: any) => p.quantity < p.oldQuantity)
  let basket = order.basket.slice()
  returnBasket.forEach((p: any) => {
    let status, gross
    const orderPackIndex = basket.findIndex((bp: any) => bp.packId === p.packId)
    if (p.quantity === 0) {
      status = 'r'
      gross = 0
    } else {
      status = 'pr'
      gross = Math.round(p.actual * addQuantity(p.purchased, -1 * p.oldQuantity, p.quantity))
    }
    basket.splice(orderPackIndex, 1, {
      ...basket[orderPackIndex],
      status,
      gross,
      returned: addQuantity(p.oldQuantity, -1 * p.quantity),
      quantity: basket[orderPackIndex].quantity // keep original quantity
    })
  })
  const profit = basket.reduce((sum: any, p: any) => sum + ['p', 'f', 'pu', 'pr'].includes(p.status) ? Math.round((p.actual - p.cost) * addQuantity(p.weight || p.purchased, -1 * (p.returned || 0))) : 0, 0)
  const total = basket.reduce((sum: any, p: any) => sum + (p.gross || 0), 0)
  const fixedFees = Math.round(setup.fixedFees * total)
  const fraction = (total + fixedFees) - Math.floor((total + fixedFees) / 5) * 5
  const deliveryFees = order.deliveryFees + (order.status === 'd' ? locationFees : 0)
  const orderRef = firebase.firestore().collection('orders').doc(order.id)
  batch.update(orderRef, {
    basket,
    total,
    profit,
    fixedFees,
    fraction,
    deliveryFees
  })
  if (total === 0) {
    updateOrderStatus(order, 'i', packPrices, packs, false, batch)
  } else if (order.status === 'd') {
    basket = basket.map((p: any) => {
      return {
        ...p,
        quantity: p.returned
      }
    })
    basket = basket.filter((p: any) => p.returned > 0)
  }
  const customerRef = firebase.firestore().collection('customers').doc(order.userId)
  if (order.status === 'd') {
    if (total === 0) {
      batch.update(customerRef, {
        deliveredOrdersCount: firebase.firestore.FieldValue.increment(-1),
        deliveredOrdersTotal: firebase.firestore.FieldValue.increment(-1 * order.total),
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

export const allocateOrderPack = (order: any, pack: any) => {
  const batch = firebase.firestore().batch()
  let basket = order.basket.slice()
  const orderPackIndex = basket.findIndex((p: any) => p.packId === pack.id)
  basket.splice(orderPackIndex, 1, {
    ...basket[orderPackIndex],
    isAllocated: true
  })
  const isFinished = basket.filter((p: any) => p.purchased > 0).length === basket.filter((p: any) => p.purchased > 0 && p.isAllocated).length
  const orderRef = firebase.firestore().collection('orders').doc(order.id)
  batch.update(orderRef, {
    basket,
    status: isFinished ? 'p' : order.status,
    lastUpdate: isFinished ? new Date() : order.lastUpdate
  })
  sendNotification(order.userId, labels.notice, labels.prepareOrder, batch)
  batch.commit()
}

export const approveInvitation = (user: any, mobile: any, status: any) => {
  const batch = firebase.firestore().batch()
  const friends = user.friends.slice()
  const invitationIndex = friends.findIndex((f: any) => f.mobile === mobile)
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

export const deleteNotification = (user: any, notificationId: any) => {
  const notifications = user.notifications.slice()
  const notificationIndex = notifications.findIndex((n: any) => n.id === notificationId)
  notifications.splice(notificationIndex, 1)
  firebase.firestore().collection('users').doc(user.id).update({
    notifications
  })
}

export const sendNotification = (userId: any, title: any, message: any, batch?: any) => {
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

export const getArchivedOrders = (month: any) => {
  let orders: any = []
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

export const getArchivedPurchases = (month: any) => {
  let purchases: any = []
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

export const getRequestedPacks = (orders: any, basket: any, packs: any) => {
  const approvedOrders = orders.filter((o: any) => ['a', 'e'].includes(o.status))
  let packsArray: any = []
  approvedOrders.forEach((o: any) => {
    o.basket.forEach((p: any) => {
      if (['n', 'p'].includes(p.status)) {
        const packInfo = packs.find((pa: any) => pa.id === p.packId)
        const found = packsArray.findIndex((pa: any) => pa.packId === p.packId && pa.price === p.price)
        if (!packInfo.byWeight && found > -1) {
          packsArray.splice(found, 1, {
            ...packsArray[found], 
            quantity: addQuantity(packsArray[found].quantity, p.quantity, -1 * p.purchased),
          })
        } else {
          packsArray.push({
            packId: p.packId,
            price: p.price, 
            quantity: addQuantity(p.quantity, -1 * p.purchased),
            orderId: o.id,
            offerId: p.offerId,
            packInfo
          })
        }
      }
    })
  })
  packsArray = packsArray.map((p: any) => {
    let inBasket, inBasketQuantity
    if (p.packInfo.byWeight) {
      inBasket = basket.packs?.find((pa: any) => pa.refPackId === p.packId && pa.orderId === p.orderId)
      inBasketQuantity = inBasket?.quantity
    } else {
      inBasket = basket.packs?.find((pa: any) => pa.refPackId === p.packId && pa.price === p.price)
      inBasketQuantity = inBasket?.quantity * inBasket?.refPackQuantity
    }	
    return !inBasketQuantity ? p : (p.packInfo.isDivided ? {...p, quantity: 0} : {...p, quantity: addQuantity(p.quantity, -1 * inBasketQuantity)})
  })
  packsArray = packsArray.filter((p: any) => p.quantity > 0)
  return packsArray.sort((p1: any, p2: any) => p1.packId > p2.packId ? 1 : -1)
}

export const getPackStores = (pack: any, packPrices: any, stores: any, packs: any, basketStockQuantity?: any) => {
  const packStores = packPrices.filter((p: any) => (p.packId === pack.id || packs.find((pa: any) => pa.id === p.packId && pa.forSale && (pa.subPackId === pack.id || pa.bonusPackId === pack.id))) && (p.storeId !== 's' || addQuantity(p.quantity, -1 * (basketStockQuantity || 0)) > 0))
  return packStores.map((s: any) => {
    let packId: any, unitPrice, unitCost, price, cost, subQuantity, offerInfo, isOffer
    if (s.packId === pack.id) {
      packId = s.packId
      price = s.price
      cost = s.cost
      unitPrice = s.price
      unitCost = s.cost
      isOffer = pack.isOffer
    } else {
      offerInfo = packs.find((p: any) => p.id === s.packId && p.subPackId === pack.id)
      price = s.price
      cost = s.cost
      if (offerInfo) {
        packId = offerInfo.id
        unitPrice = Math.round(s.price / offerInfo.subQuantity * offerInfo.subPercent * (1 + setup.profit))
        unitCost = Math.round(s.cost / offerInfo.subQuantity * offerInfo.subPercent)
        subQuantity = offerInfo.subQuantity
        isOffer = offerInfo.isOffer
      } else {
        offerInfo = packs.find((p: any) => p.id === s.packId && p.bonusPackId === pack.id)
        if (offerInfo) {
          packId = offerInfo.id
          unitPrice = Math.round(s.price / offerInfo.bonusQuantity * offerInfo.bonusPercent * (1 + setup.profit))
          unitCost = Math.round(s.cost / offerInfo.bonusQuantity * offerInfo.bonusPercent)
          subQuantity = offerInfo.bonusQuantity
          isOffer = offerInfo.isOffer
        }
      }
    }
    const storeInfo = stores.find((st: any) => st.id === s.storeId)
    const packInfo = packs.find((p: any) => p.id === packId)
    return {
      ...s,
      packId,
      price,
      cost,
      subQuantity,
      unitPrice,
      unitCost,
      isOffer,
      storeInfo,
      packInfo
    }
  })
}

export const addAdvert = async (advert: any, image: any) => {
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

export const updateAdvertStatus = (advert: any, adverts: any) => {
  const batch = firebase.firestore().batch()
  let advertRef = firebase.firestore().collection('adverts').doc(advert.id)
  batch.update(advertRef, {
    isActive: !advert.isActive
  })
  if (!advert.isActive) {
    const activeAdvert = adverts.find((a: any) => a.isActive)
    if (activeAdvert) {
      advertRef = firebase.firestore().collection('adverts').doc(activeAdvert.id)
      batch.update(advertRef, {
        isActive: false
      })
    }
  }
  batch.commit()
}

export const deleteAdvert = (advert: any) => {
  firebase.firestore().collection('adverts').doc(advert.id).delete()
}

export const editAdvert = async (advert: any, image: any) => {
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

export const mergeOrder = (order: any, basket: any, mergedOrderId: any, batch?: any) => {
  const newBatch =  batch || firebase.firestore().batch()
  const newBasket = order.basket.slice()
  basket.forEach((p: any) => {
    let newItem
    let found = newBasket.findIndex((bp: any) => bp.packId === p.packId)
    if (found === -1) {
      newItem = p
    } else {
      const status = p.status === 'f' ? 'p' : p.status
      const newQuantity = addQuantity(newBasket[found].quantity, p.quantity)
      newItem = {
        ...newBasket[found],
        quantity: newQuantity,
        status,
        gross: status === 'f' ? Math.round(p.actual * (p.weight || p.purchased)) : Math.round((p.actual || 0) * (p.weight || p.purchased)) + Math.round(p.price * addQuantity(newQuantity, -1 * p.purchased)),
      }  
    }
    newBasket.splice(found === -1 ? newBasket.length : found, 1, newItem)
  })
  const total = newBasket.reduce((sum: any, p: any) => sum + (p.gross || 0), 0)
  const fixedFees = Math.round(setup.fixedFees * total)
  const fraction = (total + fixedFees) - Math.floor((total + fixedFees) / 5) * 5
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

export const approveOrderRequest = (order: any, orders: any, packPrices: any, packs: any) => {
  const batch = firebase.firestore().batch()
  const orderRef = firebase.firestore().collection('orders').doc(order.id)
  if (order.requestType === 'm') {
    const mergedOrder = orders.find((o: any) => o.userId === order.userId && o.status === 's')
    mergeOrder(order, order.requestBasket, mergedOrder?.id || '', batch)
    sendNotification(order.userId, labels.approval, labels.approveMergeRequest, batch)
  } else if (order.requestType === 'c') {
    updateOrderStatus (order, order.status === 'a' ? 'c' : 'i', packPrices, packs, false, batch)
    sendNotification(order.userId, labels.approval, labels.approveCancelRequest, batch)
  } else {
    editOrder (order, order.requestBasket, packPrices, packs, batch)
    sendNotification(order.userId, labels.approval, labels.approveEditRequest, batch)
  }
  batch.update(orderRef, {
    requestType: firebase.firestore.FieldValue.delete(),
    requestBasket: firebase.firestore.FieldValue.delete(),
    requestTime: firebase.firestore.FieldValue.delete()
  })
  batch.commit()
}

export const confirmReturnBasket = (returnBasket: any, storeId: any, orders: any, packPrices: any, packs: any, purchases: any, stores: any) => {
  const batch = firebase.firestore().batch()
  if (returnBasket.type === 'c') {
    const purchase = purchases.find((p: any) => p.id === returnBasket.purchaseId)
    let basket = purchase.basket.map((p: any) => {
      const returnedQuantity = returnBasket.packs.find((bp: any) => bp.packId === p.packId && (!bp.weight || bp.weight === p.weight))?.quantity || 0
      return {
        ...p,
        returnedQuantity
      }
    })
    const purchaseRef = firebase.firestore().collection('purchases').doc(purchase.id)
    basket = basket.map((p: any) => {
      return {
        ...p,
        quantity: addQuantity(p.quantity, -1 * p.returnedQuantity)
      }
    })
    basket = basket.filter((p: any) => p.quantity > 0)
    let total
    if (basket.length === 0) {
      batch.delete(purchaseRef)
      total = 0
    } else {
      total = basket.reduce((sum: any, p: any) => sum + Math.round(p.cost * p.quantity), 0)
      batch.update(purchaseRef, {
        basket,
        total
      })
    }
    updateStoreBalance(batch, storeId, total - purchase.total, purchase.time, stores)
    returnBasket.packs.forEach((p: any) => {
      returnPurchasePack(batch, purchase, p, orders, packPrices, packs)
    })  
  }
  batch.commit()
}

export const returnPurchasePack = (batch: any, purchase: any, pack: any, orders: any, packPrices: any, packs: any) => {
  const purchaseQuantity = purchase.basket.find((p: any) => p.packId === pack.packId && (!p.weight || p.weight === pack.weight)).quantity
  if (purchaseQuantity === pack.quantity) {
    const affectedOrders = orders.filter((o: any) => o.basket.find((p: any) => p.lastPurchaseId === purchase.id))
    affectedOrders.forEach((o: any) => {
      const orderBasket = o.basket
      const orderPackIndex = orderBasket.findIndex((p: any) => p.lastPurchaseId === purchase.id && p.packId === pack.packId)
      const affectedPack = orderBasket[orderPackIndex]
      let avgCost, avgActual, status, newPurchased, newWeight
      if (affectedPack.purchased === affectedPack.lastPurchased) {
        newPurchased = 0
        avgCost = 0
        avgActual = 0
        status = 'n'
      } else if (affectedPack.weight > 0) {
        newWeight = addQuantity(affectedPack.weight, -1 * pack.weight)
        avgCost = Math.round((affectedPack.cost * affectedPack.weight + pack.cost * pack.weight) / newWeight)
        avgActual = Math.round((affectedPack.actual * affectedPack.weight + pack.actual * pack.weight) / newWeight)
        newPurchased = addQuantity(affectedPack.purchased, -1 * affectedPack.lastPurchased)
        status = 'p'
      } else {
        newPurchased = addQuantity(affectedPack.purchased, -1 * affectedPack.lastPurchased)
        avgCost = Math.round((affectedPack.cost * affectedPack.purchased - pack.cost * affectedPack.lastPurchased) / newPurchased)
        avgActual = Math.round((affectedPack.actual * affectedPack.purchased - pack.actual * affectedPack.lastPurchased) / newPurchased)
        status = 'p'
      }
      const newPack = {
        ...affectedPack,
        purchased: newPurchased,
        storeId: affectedPack.prevStoreId,
        cost: avgCost,
        actual: avgActual,
        gross: Math.round(avgActual * (newWeight || newPurchased)) + Math.round(affectedPack.price * addQuantity(affectedPack.quantity, -1 * newPurchased)),
        status
      }
      if (newWeight) newPack['weight'] = newWeight
      orderBasket.splice(orderPackIndex, 1, newPack)
      const profit = orderBasket.reduce((sum: any, p: any) => sum + ['p', 'f', 'pu'].includes(p.status) ? Math.round((p.actual - p.cost) * (p.weight || p.purchased)) : 0, 0)
      const total = orderBasket.reduce((sum: any, p: any) => sum + (p.gross || 0), 0)
      const fixedFees = Math.round(setup.fixedFees * total)  
      const fraction = (total + fixedFees) - Math.floor((total + fixedFees) / 5) * 5
      const orderRef = firebase.firestore().collection('orders').doc(o.id)
      batch.update(orderRef, {
        basket: orderBasket,
        profit,
        total,
        fixedFees,
        fraction,
        status: orderBasket.find((bp: any) => bp.status === 'p') ? 'e' : 'a',
        lastUpdate: new Date()
      })
    })  
  }
}

export const permitUser = async (userId: any, storeId: any, users: any, stores: any) => {
  const userInfo = users.find((u: any) => u.id === userId)
  let name
  if (storeId) {
    name = `${userInfo.name}-${stores.find((s: any) => s.id === storeId).name}:${userInfo.mobile}`
    await firebase.firestore().collection('customers').doc(userId).update({
      storeId,
      name
    })  
  } else {
    name = `${userInfo.name}:${userInfo.mobile}`
    await firebase.firestore().collection('customers').doc(userId).update({
      storeId: firebase.firestore.FieldValue.delete(),
      name
    })  
  }
  const colors = userInfo.colors.map((c: any) => randomColors.find(rc => rc.name === c)?.id)
  const password = colors.join('')
  await firebase.auth().signInWithEmailAndPassword(userInfo.mobile + '@gmail.com', userInfo.mobile.substring(9, 2) + password)
  await firebase.auth().currentUser?.updateProfile({
    displayName: storeId
  })
  return firebase.auth().signOut()
}

export const registerUser = async (email: any, password: any) => {
  await firebase.auth().createUserWithEmailAndPassword(email, password)
  return firebase.auth().currentUser?.updateProfile({
    displayName: 'a'
  })
}

export const deleteLog = (log: any) => {
  firebase.firestore().collection('logs').doc(log.id).delete()
}

export const archiveProduct = (product: any, packs: any) => {
  const batch = firebase.firestore().batch()
  const productRef = firebase.firestore().collection('products').doc(product.id)
  batch.update(productRef, {
    isArchived: true
  })
  const affectedPacks = packs.filter((p: any) => p.productId === product.id)
  affectedPacks.forEach((p: any) => {
    const packRef = firebase.firestore().collection('packs').doc(p.id)
    batch.update(packRef, {
      isArchived: true
    })
  })
  batch.commit()
}

export const getArchivedProducts = async () => {
  let products: any = []
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
  let packs: any = []
  await firebase.firestore().collection('packs')
          .where('isArchived', '==', true)
          .get().then(docs => {
            docs.forEach(doc => {
              packs.push({...doc.data(), id:doc.id})
            })
          })
  return packs
}

export const approveNotifyFriends = (userInfo: any, pack: any, users: any) => {
  const batch = firebase.firestore().batch()
  let userFriends = userInfo.friends?.slice() || []
  userFriends = userFriends.filter((f: any) => f.status === 'r')
  userFriends.forEach((f: any) => {
    const friendInfo = users.find((u: any) => u.mobile === f.mobile)
    if (friendInfo) {
      sendNotification(friendInfo.id, `${labels.notifyFromFriend} ${userInfo.name}`, `${labels.offerAvailableFor} ${pack.productName} ${pack.name}, ${labels.withPrice}: ${(pack.price / 100).toFixed(2)}`, batch)
    }
  })
  const userRef = firebase.firestore().collection('users').doc(userInfo.id)
  batch.update(userRef, {
    notifyFriends: firebase.firestore.FieldValue.arrayRemove(pack.id)
  })
  batch.commit()
}

export const addStorePayment = (storeId: any, payment: any, stores: any) => {
  const batch = firebase.firestore().batch()
  const storeRef = firebase.firestore().collection('stores').doc(storeId)
  batch.update(storeRef, {
    payments: firebase.firestore.FieldValue.arrayUnion(payment)
  })
  updateStoreBalance(batch, storeId, ['f', 'r'].includes(payment.type) ? payment.amount : -1 * payment.amount, payment.paymentDate, stores)
  batch.commit()
}

export const setDeliveryTime = (orderId: any, deliveryTime: any) => {
  firebase.firestore().collection('orders').doc(orderId).update({
    deliveryTime,
    lastUpdate: new Date()
  })
}

export const getProdData = async () => {
  let categories: any = []
  await prodApp.firestore().collection('categories')
          .get().then(docs => {
            docs.forEach(doc => {
              categories.push({...doc.data(), id:doc.id})
            })
          })
  return categories
}

export const categoryChildren = (categoryId: any, categories: any) => {
  let result = [categoryId]
  const children = categories.filter((c: any) => c.parentId === categoryId)
  for (let child of children) {
    const childrenArray = categoryChildren(child.id, categories)
    result.push(...childrenArray)
  }
  return result
}