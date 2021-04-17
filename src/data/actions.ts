import firebase, { prodApp } from './firebase'
import labels from './labels'
import { f7 } from 'framework7-react'
import { setup, randomColors } from './config'
import moment from 'moment'
import { Advert } from './interfaces'

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
    isBlocked: false,
    storeId,
    deliveryFees: 0,
    specialDiscount: 0,
    discounts: 0,
    mapPosition: '',
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

export const deleteUser = async (user: any) => {
  const colors = user.colors.map((c: any) => randomColors.find(rc => rc.name === c)?.id)
  const password = colors.join('')
  await firebase.firestore().collection('users').doc(user.id).delete()
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

export const getRequestedPacks = (basket: any, packs: any) => {
  let packsArray: any = []
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

export const addAdvert = async (advert: Advert, image?: File) => {
  const advertRef = firebase.firestore().collection('adverts').doc()
  let imageUrl = ''
  if (image) {
    const filename = image.name
    const ext = filename.slice(filename.lastIndexOf('.'))
    const fileData = await firebase.storage().ref().child('adverts/' + advertRef.id + ext).put(image)
    imageUrl = await firebase.storage().ref().child(fileData.metadata.fullPath).getDownloadURL()
  }
  advertRef.set({
    ...advert,
    imageUrl,
  })
}

export const deleteAdvert = (advert: any) => {
  firebase.firestore().collection('adverts').doc(advert.id).delete()
}

export const editAdvert = async (advert: any, image?: File) => {
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