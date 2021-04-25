import firebase, { prodApp } from './firebase'
import labels from './labels'
import { f7 } from 'framework7-react'
import { randomColors } from './config'
import { Advert, Alarm, Category, Country, Error, Location, Log, Pack, PackPrice, PackType, Product, Rating, Store, Trademark, Unit, User } from './types'

export const getMessage = (path: string, error: Error) => {
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

export const showMessage = (messageText: string) => {
  const message = f7.toast.create({
    text: `<span class="success">${messageText}<span>`,
    closeTimeout: 3000,
  })
  message.open()
}

export const showError = (messageText: string) => {
  const message = f7.toast.create({
    text: `<span class="error">${messageText}<span>`,
    closeTimeout: 3000,
  })
  message.open()
}

export const quantityText = (quantity: number, weight?: number): string => {
  return weight && weight !== quantity ? `${quantityText(quantity)}(${quantityText(weight)})` : quantity === Math.trunc(quantity) ? quantity.toString() : quantity.toFixed(3)
}

export const addQuantity = (q1: number, q2: number, q3 = 0) => {
  return Math.trunc(q1 * 1000 + q2 * 1000 + q3 * 1000) / 1000
  }

export const productOfText = (countryName: string, trademarkName?: string) => {
  return trademarkName ? `${labels.productFrom} ${trademarkName}-${countryName}` : `${labels.productOf} ${countryName}`
}

export const login = (email: string, password: string) => {
  return firebase.auth().signInWithEmailAndPassword(email, password)
}

export const logout = () => {
  firebase.auth().signOut()
}

export const addPackPrice = (storePack: PackPrice, packPrices: PackPrice[], packs: Pack[], batch?: firebase.firestore.WriteBatch) => {
  const newBatch = batch || firebase.firestore().batch()
  const { packId, ...others } = storePack
  const pack = packs.find(p => p.id === packId)!
  let packRef = firebase.firestore().collection('packs').doc(pack.id)
  newBatch.update(packRef, {
    prices: firebase.firestore.FieldValue.arrayUnion(others)
  })
  if (!batch) {
    newBatch.commit()
  }
}

export const addProduct = async (product: Product, image?: File) => {
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

export const deleteProduct = async (product: Product) => {
  if (product.imageUrl) {
    try{
      await firebase.storage().ref().child('products/' + product.id + '.jpg').delete()
    } catch {
      await firebase.storage().ref().child('products/' + product.id + '.jpeg').delete()
    }  
  }
  firebase.firestore().collection('products').doc(product.id).delete()
}

export const editProduct = async (product: Product, oldName: string, packs: Pack[], image?: File) => {
  const batch = firebase.firestore().batch()
  const { id, ...others } = product
  let imageUrl: string
  if (image) {
    const filename = image.name
    const ext = filename.slice(filename.lastIndexOf('.'))
    const fileData = await firebase.storage().ref().child('products/' + id + ext).put(image)
    imageUrl = await firebase.storage().ref().child(fileData.metadata.fullPath).getDownloadURL()
    others['imageUrl'] = imageUrl
  }
  const productRef = firebase.firestore().collection('products').doc(id)
  batch.update(productRef, others)
  let affectedPacks = packs.filter(p => p.product.id === id)
  affectedPacks.forEach(p => {
    const packRef = firebase.firestore().collection('packs').doc(p.id)
    if (image && ((!p.subPackId && !p.specialImage) || (p.subPackId && !p.specialImage && packs.find(sp => sp.id === p.subPackId)!.specialImage === false))) {
      batch.update(packRef, product)
    } else {
      const { imageUrl, ...others } = product
      batch.update(packRef, others)
    }
  })
  batch.commit()
}

export const editPrice = (storePack: PackPrice, oldPrice: number, packPrices: PackPrice[], packs: Pack[], batch?: firebase.firestore.WriteBatch) => {
  const newBatch = batch || firebase.firestore().batch()
  const packStores = packPrices.filter(p => p.packId === storePack.packId)
  const otherStores = packStores.filter(p => p.storeId !== storePack.storeId)
  otherStores.push(storePack)
  const prices = otherStores.map(p => {
    const { packId, ...others } = p
    return others
  })
  let packRef = firebase.firestore().collection('packs').doc(storePack.packId)
  newBatch.update(packRef, {
    prices
  })
  if (!batch) {
    newBatch.commit()
  }
}

export const deleteStorePack = (storePack: PackPrice, packPrices: PackPrice[], packs: Pack[], batch?: firebase.firestore.WriteBatch) => {
  const newBatch = batch || firebase.firestore().batch()
  const pack = packs.find(p => p.id === storePack.packId)!
  const packStores = packPrices.filter(p => p.packId === storePack.packId)
  const otherStores = packStores.filter(p => p.storeId !== storePack.storeId)
  const prices = otherStores.map(p => {
    const { packId, ...others } = p
    return others
  })
  let packRef = firebase.firestore().collection('packs').doc(pack.id)
  newBatch.update(packRef, {
    prices
  })
  if (!batch) {
    newBatch.commit()
  }
}

export const addStore = (store: Store) => {
  firebase.firestore().collection('stores').add(store)
}

export const editStore = (store: Store) => {
  const { id, ...others } = store
  firebase.firestore().collection('stores').doc(id).update(others)
}

export const addCountry = (country: Country) => {
  firebase.firestore().collection('lookups').doc('c').set({
    values: firebase.firestore.FieldValue.arrayUnion(country)
  }, {merge: true})
}

export const deleteCountry = (countryId: string, countries: Country[]) => {
  const values = countries.slice()
  const countryIndex = values.findIndex(c => c.id === countryId)
  values.splice(countryIndex, 1)
  firebase.firestore().collection('lookups').doc('c').update({
    values
  })
}

export const editCountry = (country: Country, countries: Country[]) => {
  const values = countries.slice()
  const countryIndex = values.findIndex(c => c.id === country.id)
  values.splice(countryIndex, 1, country)
  firebase.firestore().collection('lookups').doc('c').update({
    values
  })
}

export const addPackType = (packType: PackType) => {
  firebase.firestore().collection('lookups').doc('p').set({
    values: firebase.firestore.FieldValue.arrayUnion(packType)
  }, {merge: true})
}

export const editPackType = (packType: PackType, packTypes: PackType[]) => {
  const values = packTypes.slice()
  const packTypeIndex = values.findIndex(t => t.id === packType.id)
  values.splice(packTypeIndex, 1, packType)
  firebase.firestore().collection('lookups').doc('p').update({
    values
  })
}

export const deletePackType = (packTypeId: string, packTypes: PackType[]) => {
  const values = packTypes.slice()
  const packTypeIndex = values.findIndex(t => t.id === packTypeId)
  values.splice(packTypeIndex, 1)
  firebase.firestore().collection('lookups').doc('p').update({
    values
  })
}

export const addUnit = (unit: Unit) => {
  firebase.firestore().collection('lookups').doc('u').set({
    values: firebase.firestore.FieldValue.arrayUnion(unit)
  }, {merge: true})
}

export const editUnit = (unit: Unit, units: Unit[]) => {
  const values = units.slice()
  const unitIndex = values.findIndex(u => u.id === unit.id)
  values.splice(unitIndex, 1, unit)
  firebase.firestore().collection('lookups').doc('u').update({
    values
  })
}

export const deleteUnit = (unitId: string, units: Unit[]) => {
  const values = units.slice()
  const unitIndex = values.findIndex(u => u.id === unitId)
  values.splice(unitIndex, 1)
  firebase.firestore().collection('lookups').doc('u').update({
    values
  })
}

export const addLocation = (location: Location) => {
  firebase.firestore().collection('lookups').doc('l').set({
    values: firebase.firestore.FieldValue.arrayUnion(location)
  }, {merge: true})
}

export const editLocation = (location: Location, locations: Location[]) => {
  const values = locations.slice()
  const locationIndex = values.findIndex(l => l.id === location.id)
  values.splice(locationIndex, 1, location)
  firebase.firestore().collection('lookups').doc('l').update({
    values
  })
}

export const addTrademark = (trademark: Trademark) => {
  firebase.firestore().collection('lookups').doc('t').set({
    values: firebase.firestore.FieldValue.arrayUnion(trademark)
  }, {merge: true})
}

export const editTrademark = (trademark: Trademark, trademarks: Trademark[]) => {
  const values = trademarks.slice()
  const trademarkIndex = values.findIndex(t => t.id === trademark.id)
  values.splice(trademarkIndex, 1, trademark)
  firebase.firestore().collection('lookups').doc('t').update({
    values
  })
}

export const deleteTrademark = (trademarkId: string, trademarks: Trademark[]) => {
  const values = trademarks.slice()
  const trademarkIndex = values.findIndex(t => t.id === trademarkId)
  values.splice(trademarkIndex, 1)
  firebase.firestore().collection('lookups').doc('t').update({
    values
  })
}

export const addCategory = (parentId: string, name: string, ordering: number) => {
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

export const editCategory = (category: Category, oldCategory: Category, categories: Category[]) => {
  const batch = firebase.firestore().batch()
  const { id, ...others } = category
  let categoryRef = firebase.firestore().collection('categories').doc(id)
  batch.update(categoryRef, others)
  if (category.parentId !== oldCategory.parentId) {
    categoryRef = firebase.firestore().collection('categories').doc(category.parentId)
    batch.update(categoryRef, {
      isLeaf: false
    })
    const childrenCount = categories.filter(c => c.id !== id && c.parentId === oldCategory.parentId).length
    if (childrenCount === 0) {
      categoryRef = firebase.firestore().collection('categories').doc(oldCategory.parentId)
      batch.update(categoryRef, {
        isLeaf: true
      })  
    }
  }
  batch.commit()
}

export const deleteCategory = (category: Category, categories: Category[]) => {
  const batch = firebase.firestore().batch()
  firebase.firestore().collection('categories').doc(category.id).delete()
  const childrenCount = categories.filter(c => c.id !== category.id && c.parentId === category.parentId).length
  if (childrenCount === 0) {
    let categoryRef = firebase.firestore().collection('categories').doc(category.parentId)
    batch.update(categoryRef, {
      isLeaf: true
    })
  }
  batch.commit()
}

export const getCategoryName = (category: Category, categories: Category[]): string => {
  if (category.parentId === '0') {
    return category.name
  } else {
    const categoryParent = categories.find(c => c.id === category.parentId)!
    return getCategoryName(categoryParent, categories) + '-' + category.name
  }
}

export const resolvePasswordRequest = (requestId: string) => {
  firebase.firestore().collection('password-requests').doc(requestId).delete()
}

export const addPack = async (pack: Pack, product: Product, image?: File, subPackInfo?: Pack) => {
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
    product,
    imageUrl,
    specialImage
  })
}

export const deletePack = (packId: string) => {
  firebase.firestore().collection('packs').doc(packId).delete()
}

export const editPack = async (newPack: Pack, oldPack: Pack, packs: Pack[], image?: File) => {
  const batch = firebase.firestore().batch()
  const { id, ...others } = newPack
  let imageUrl: string
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
      typeUnits: p.subQuantity! * newPack.typeUnits!,
      standardUnits: p.subQuantity! * newPack.standardUnits!,
      byWeight: newPack.byWeight,
      packTypeId: newPack.packTypeId,
      unitId: newPack.unitId,
      imageUrl
    }
    if (image && !p.specialImage) {
      batch.update(packRef, packInfo)
    } else {
      const { imageUrl, ...others } = packInfo
      batch.update(packRef, others)
    }
  })
  batch.commit()
}

export const deleteUser = async (user: User) => {
  const colors = user.colors?.map(c => randomColors.find(rc => rc.name === c)?.id)
  if (!colors) return
  const password = colors.join('')
  await firebase.firestore().collection('users').doc(user.id).delete()
  await firebase.auth().signInWithEmailAndPassword(user.mobile + '@gmail.com', user.mobile.substring(9, 2) + password)
  return firebase.auth().currentUser?.delete()
}

export const approveAlarm = (user: User, alarm: Alarm, newPackId: string, packPrices: PackPrice[], packs: Pack[]) => {
  const batch = firebase.firestore().batch()
  if (!user.alarms) return
  const alarms = user.alarms.slice()
  const alarmIndex = alarms.findIndex(a => a.id === alarm.id)
  alarms.splice(alarmIndex, 1, {
    ...user.alarms[alarmIndex],
    status: 'a',
    storeId: user.storeId,
    newPackId
  })
  const userRef = firebase.firestore().collection('users').doc(user.id)
  batch.update(userRef, {
    alarms
  })
  const storePack = packPrices.find(p => p.storeId === user.storeId && p.packId === (newPackId || alarm.packId))!
  let offerEnd
  if (alarm.offerDays) {
    offerEnd = alarm.time
    offerEnd.setDate(offerEnd.getDate() + alarm.offerDays)
  }
  const newStorePack = { 
    packId: newPackId || alarm.packId!, 
    storeId: user.storeId!,
    cost: alarm.price,
    price: alarm.price,
    offerEnd,
    isAuto: false,
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

export const changePassword = async (oldPassword: string, newPassword: string) => {
  let user = firebase.auth().currentUser
  if (!user) return
  const email = user.email
  if (!email) return
  await firebase.auth().signInWithEmailAndPassword(email, oldPassword)
  user = firebase.auth().currentUser!
  return user.updatePassword(newPassword)
}

export const approveRating = (rating: Rating, packs: Pack[]) => {
  const batch = firebase.firestore().batch()
  const ratings = rating.userInfo?.ratings?.slice()
  if (!ratings) return
  const ratingIndex = ratings.findIndex(r => r.productId === rating.productInfo?.id)
  ratings.splice(ratingIndex, 1, {
    ...ratings[ratingIndex],
    status: 'a'
  })
  const userRef = firebase.firestore().collection('users').doc(rating.userInfo?.id)
  batch.update(userRef, {
    ratings
  })
  const oldRating = rating.productInfo?.rating ?? 0
  const ratingCount = rating.productInfo?.ratingCount ?? 0
  const newRating = Math.round((oldRating * ratingCount + rating.value) / (ratingCount + 1))
  const productRef = firebase.firestore().collection('products').doc(rating.productInfo?.id)
  batch.update(productRef, {
    rating: newRating,
    ratingCount: ratingCount + 1
  })
  const affectedPacks = packs.filter(p => p.product.id === rating.productInfo?.id)
  affectedPacks.forEach(p => {
    const packRef = firebase.firestore().collection('packs').doc(p.id)
    batch.update(packRef, {
      rating: newRating,
      ratingCount: ratingCount + 1
    })
  })
  batch.commit()
}

export const deleteNotification = (user: User, notificationId: string) => {
  const notifications = user.notifications?.slice()
  if (!notifications) return
  const notificationIndex = notifications.findIndex(n => n.id === notificationId)
  notifications.splice(notificationIndex, 1)
  firebase.firestore().collection('users').doc(user.id).update({
    notifications
  })
}

export const sendNotification = (userId: string, title: string, message: string, batch?: firebase.firestore.WriteBatch) => {
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

export const getPackStores = (pack: Pack, packPrices: PackPrice[], stores: Store[], packs: Pack[]) => {
  const packStores = packPrices.filter(p => p.packId === pack.id || packs.find(pa => pa.id === p.packId && pa.subPackId === pack.id))
  return packStores.map(s => {
    let packId = ''
    let unitPrice, price, subQuantity, offerInfo, isOffer
    if (s.packId === pack.id) {
      packId = s.packId
      price = s.price
      unitPrice = s.price
      isOffer = pack.isOffer
    } else {
      offerInfo = packs.find(p => p.id === s.packId && p.subPackId === pack.id)!
      price = s.price
      packId = offerInfo.id!
      unitPrice = Math.round(s.price / offerInfo.subQuantity!)
      subQuantity = offerInfo.subQuantity
      isOffer = offerInfo.isOffer
    }
    const storeInfo = stores.find(st => st.id === s.storeId)!
    const packInfo = packs.find(p => p.id === packId)!
    return {
      ...s,
      packId,
      price,
      subQuantity,
      unitPrice,
      isOffer,
      storeInfo,
      packInfo
    }
  })
}

export const updateAdvertStatus = (advert: Advert, adverts: Advert[]) => {
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

export const deleteAdvert = (advert: Advert) => {
  firebase.firestore().collection('adverts').doc(advert.id).delete()
}

export const editAdvert = async (advert: Advert, image?: File) => {
  const { id, ...others } = advert
  if (image) {
    const filename = image.name
    const ext = filename.slice(filename.lastIndexOf('.'))
    const fileData = await firebase.storage().ref().child('adverts/' + id + ext).put(image)
    const url = await firebase.storage().ref().child(fileData.metadata.fullPath).getDownloadURL()
    others['imageUrl'] = url
    const oldExt = advert.imageUrl?.slice(advert.imageUrl.lastIndexOf('.'), advert.imageUrl.indexOf('?'))
    if (ext !== oldExt) {
      const oldImage = firebase.storage().ref().child('adverts/' + id + oldExt)
      await oldImage.delete()
    }
  }
  firebase.firestore().collection('adverts').doc(id).update(others)
}

export const permitUser = (user: User, address: string) => {
  const batch = firebase.firestore().batch()
  const store = {
    name: user.storeName,
    mobile: user.mobile,
    isActive: true,
    locationId: user.locationId,
    address
  }
  const storeRef = firebase.firestore().collection('stores').doc()
  batch.set(storeRef, store)
  const userRef = firebase.firestore().collection('users').doc(user.id)
  batch.update(userRef, {
    storeId: storeRef.id,
  })
  batch.commit()
  // const colors = userInfo.colors?.map(c => randomColors.find(rc => rc.name === c)?.id)
  // if (!colors) return
  // const password = colors.join('')
  // await firebase.auth().signInWithEmailAndPassword(userInfo.mobile + '@gmail.com', userInfo.mobile.substring(9, 2) + password)
  // await firebase.auth().currentUser?.updateProfile({
  //   displayName: storeId
  // })
  // return firebase.auth().signOut()
}

export const registerUser = async (email: string, password: string) => {
  await firebase.auth().createUserWithEmailAndPassword(email, password)
  return firebase.auth().currentUser?.updateProfile({
    displayName: 'a'
  })
}

export const deleteLog = (log: Log) => {
  firebase.firestore().collection('logs').doc(log.id).delete()
}

export const archiveProduct = (product: Product, packs: Pack[]) => {
  const batch = firebase.firestore().batch()
  const productRef = firebase.firestore().collection('products').doc(product.id)
  batch.update(productRef, {
    isArchived: true
  })
  const affectedPacks = packs.filter(p => p.product.id === product.id)
  affectedPacks.forEach(p => {
    const packRef = firebase.firestore().collection('packs').doc(p.id)
    batch.update(packRef, {
      isArchived: true
    })
  })
  batch.commit()
}

export const getArchivedProducts = async () => {
  let products: Product[] = []
  await firebase.firestore().collection('products')
          .where('isArchived', '==', true)
          .get().then(docs => {
            docs.forEach(doc => {
              products.push({
                id: doc.id,
                name: doc.data().name,
                alias: doc.data().alias,
                description: doc.data().description,
                categoryId: doc.data().categoryId,
                trademarkId: doc.data().trademarkId,
                countryId: doc.data().countryId,
                unitType: doc.data().unitType,
                imageUrl: doc.data().imageUrl,
                rating: doc.data().rating,
                ratingCount: doc.data().ratingCount,
                isArchived: doc.data().isArchived
              })
            })
          })
  return products
}

export const getArchivedPacks = async () => {
  let packs: Pack[] = []
  await firebase.firestore().collection('packs')
          .where('isArchived', '==', true)
          .get().then(docs => {
            docs.forEach(doc => {
              packs.push({
                id: doc.id,
                name: doc.data().name,
                product: doc.data().product,
                imageUrl: doc.data().imageUrl,
                price: doc.data().price,
                isOffer: doc.data().isOffer,
                offerEnd: doc.data().offerEnd,
                byWeight: doc.data().byWeight,
                weightedPrice: doc.data().weightedPrice,
                typeUnits: doc.data().typeUnits,
                standardUnits: doc.data().standardUnits,
                packTypeId: doc.data().packTypeId,
                unitId: doc.data().unitId,
                specialImage: doc.data().specialImage
              })
            })
          })
  return packs
}

export const getProdData = async () => {
  let categories: Category[] = []
  await prodApp.firestore().collection('categories')
          .get().then(docs => {
            docs.forEach(doc => {
              categories.push({
                id: doc.id,
                name: doc.data().name,
                parentId: doc.data().parentId,
                ordering: doc.data().ordering,
                isLeaf: doc.data().isLeaf,
                isActive: doc.data().isActive
              })
            })
          })
  return categories
}

export const categoryChildren = (categoryId: string, categories: Category[]) => {
  let result = [categoryId]
  const children = categories.filter(c => c.parentId === categoryId)
  for (let child of children) {
    const childrenArray = categoryChildren(child.id, categories)
    result.push(...childrenArray)
  }
  return result
}