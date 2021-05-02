import firebase, {prodApp} from './firebase'
import labels from './labels'
import {f7} from 'framework7-react'
import {randomColors} from './config'
import {Advert, Category, Country, Error, Location, Log, Pack, PackPrice, Product, ProductRequest, Rating, Store, Trademark, Unit, User} from './types'

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

export const productOfText = (countryName: string, trademarkName?: string) => {
  return trademarkName ? `${labels.productFrom} ${trademarkName}-${countryName}` : `${labels.productOf} ${countryName}`
}

export const login = (email: string, password: string) => {
  return firebase.auth().signInWithEmailAndPassword(email, password)
}

export const logout = () => {
  firebase.auth().signOut()
}

export const addPackPrice = (storePack: PackPrice, packs: Pack[], batch?: firebase.firestore.WriteBatch) => {
  const newBatch = batch || firebase.firestore().batch()
  const {packId, ...others} = storePack
  const pack = packs.find(p => p.id === packId)!
  let packRef = firebase.firestore().collection('packs').doc(pack.id)
  newBatch.update(packRef, {
    prices: firebase.firestore.FieldValue.arrayUnion(others)
  })
  if (!batch) {
    newBatch.commit()
  }
}

export const addProduct = async (product: Product, pack: Pack, productRequest?: ProductRequest, image?: File) => {
  const batch = firebase.firestore().batch()
  const productRef = firebase.firestore().collection('products').doc()
  let imageUrl = ''
  if (image) {
    const filename = image.name
    const ext = filename.slice(filename.lastIndexOf('.'))
    const fileData = await firebase.storage().ref().child('products/' + productRef.id + ext).put(image)
    imageUrl = await firebase.storage().ref().child(fileData.metadata.fullPath).getDownloadURL()
  }
  product.imageUrl = imageUrl
  batch.set(productRef, product)
  const packRef = firebase.firestore().collection('packs').doc()
  pack.imageUrl = imageUrl
  pack.product.id = productRef.id
  batch.set(packRef, pack)
  if (productRequest) {
    const productRequestRef = firebase.firestore().collection('product-requests').doc(productRequest.id)
    batch.delete(productRequestRef)
    sendNotification(productRequest.userId, labels.approval, `${labels.approveProduct} ${productRequest.name}`, batch)
    const ext = productRequest.imageUrl.slice(productRequest.imageUrl.lastIndexOf('.'), productRequest.imageUrl.indexOf('?'))
    const image = firebase.storage().ref().child('product-requests/' + productRequest.id + ext)
    await image.delete()
  }
  batch.commit()
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
  const {id, ...others} = product
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
      const {imageUrl, ...others} = product
      batch.update(packRef, others)
    }
  })
  batch.commit()
}

export const editPrice = (storePack: PackPrice, packPrices: PackPrice[], batch?: firebase.firestore.WriteBatch) => {
  const newBatch = batch || firebase.firestore().batch()
  const packStores = packPrices.filter(p => p.packId === storePack.packId)
  const otherStores = packStores.filter(p => p.storeId !== storePack.storeId)
  otherStores.push(storePack)
  const prices = otherStores.map(p => {
    const {packId, ...others} = p
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
    const {packId, ...others} = p
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
  const {id, ...others} = store
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
  const {id, ...others} = category
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
  const {id, ...others} = newPack
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
      unitId: newPack.unitId,
      imageUrl
    }
    if (image && !p.specialImage) {
      batch.update(packRef, packInfo)
    } else {
      const {imageUrl, ...others} = packInfo
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

export const changePassword = async (oldPassword: string, newPassword: string) => {
  let user = firebase.auth().currentUser
  if (!user) return
  const email = user.email
  if (!email) return
  await firebase.auth().signInWithEmailAndPassword(email, oldPassword)
  user = firebase.auth().currentUser!
  return user.updatePassword(newPassword)
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
  const {id, ...others} = advert
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
    position: user.position,
    address
  }
  const storeRef = firebase.firestore().collection('stores').doc()
  batch.set(storeRef, store)
  const userRef = firebase.firestore().collection('users').doc(user.id)
  batch.update(userRef, {
    storeId: storeRef.id,
  })
  batch.commit()
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
                byWeight: doc.data().byWeight,
                weightedPrice: doc.data().weightedPrice,
                typeUnits: doc.data().typeUnits,
                standardUnits: doc.data().standardUnits,
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

export const rejectProductRequest = async (productRequest: ProductRequest) => {
  const batch = firebase.firestore().batch()
  const productRequestRef = firebase.firestore().collection('product-requests').doc(productRequest.id)
  batch.delete(productRequestRef)
  sendNotification(productRequest.userId, labels.rejection, `${labels.rejectProduct} ${productRequest.name}`, batch)
  batch.commit()
  const ext = productRequest.imageUrl.slice(productRequest.imageUrl.lastIndexOf('.'), productRequest.imageUrl.indexOf('?'))
  const image = firebase.storage().ref().child('product-requests/' + productRequest.id + ext)
  await image.delete()
}

