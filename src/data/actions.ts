import firebase, {prodApp} from './firebase'
import labels from './labels'
import {randomColors, storeTypes} from './config'
import {Advert, Category, Country, Error, Location, Log, Pack, PackRequest, PackStore, Product, ProductRequest, Store, Trademark, User, Notification} from './types'

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

export const addPackStore = async (packStore: PackStore, packs: Pack[], users?: User[], packRequests?: PackRequest[], packRequest?: PackRequest) => {
  const batch = firebase.firestore().batch()
  const {packId, ...others} = packStore
  const pack = packs.find(p => p.id === packId)!
  let packRef = firebase.firestore().collection('packs').doc(pack.id)
  batch.update(packRef, {
    stores: firebase.firestore.FieldValue.arrayUnion(others),
    isActive: true,
    lastTrans: new Date()
  })
  if (packRequest) {
    const storeRef = firebase.firestore().collection('stores').doc(packRequest.storeId)
    const otherPackRequests = packRequests?.filter(r => r.storeId === packRequest.storeId && r.id !== packRequest.id)
    batch.update(storeRef, {
      packRequests: otherPackRequests
    })
    const user = users?.find(u => u.storeId === packRequest.storeId)!
    sendNotification(user.id, labels.approval, `${labels.approveProduct} ${packRequest.name}`, batch)
    if (packRequest.imageUrl) {
      const ext = packRequest.imageUrl.slice(packRequest.imageUrl.lastIndexOf('.'), packRequest.imageUrl.indexOf('?'))
      const image = firebase.storage().ref().child('requests/' + packRequest.id + ext)
      await image.delete()
    }
  }
  batch.commit()
}

export const addProduct = async (product: Product, pack: Pack, users: User[], productRequest?: ProductRequest, productRequests?: ProductRequest[], image?: File) => {
  const batch = firebase.firestore().batch()
  const productRef = firebase.firestore().collection('products').doc()
  if (image) {
    const filename = image.name
    const ext = filename.slice(filename.lastIndexOf('.'))
    const fileData = await firebase.storage().ref().child('products/' + productRef.id + ext).put(image)
    product.imageUrl = await firebase.storage().ref().child(fileData.metadata.fullPath).getDownloadURL()
  }
  batch.set(productRef, product)
  const packRef = firebase.firestore().collection('packs').doc()
  pack.product.id = productRef.id
  batch.set(packRef, pack)
  if (productRequest) {
    const storeRef = firebase.firestore().collection('stores').doc(productRequest.storeId)
    const otherProductRequests = productRequests?.filter(r => r.storeId === productRequest.storeId && r.id !== productRequest.id)
    batch.update(storeRef, {
      productRequests: otherProductRequests
    })
    const user = users.find(u => u.storeId === productRequest.storeId)!
    sendNotification(user.id, labels.approval, `${labels.approveProduct} ${productRequest.name}`, batch)
    const ext = productRequest.imageUrl.slice(productRequest.imageUrl.lastIndexOf('.'), productRequest.imageUrl.indexOf('?'))
    const image = firebase.storage().ref().child('requests/' + productRequest.id + ext)
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
  if (image) {
    const filename = image.name
    const ext = filename.slice(filename.lastIndexOf('.'))
    const fileData = await firebase.storage().ref().child('products/' + id + ext).put(image)
    others.imageUrl = await firebase.storage().ref().child(fileData.metadata.fullPath).getDownloadURL()
  }
  const productRef = firebase.firestore().collection('products').doc(id)
  batch.update(productRef, others)
  let affectedPacks = packs.filter(p => p.product.id === id)
  affectedPacks.forEach(p => {
    const packRef = firebase.firestore().collection('packs').doc(p.id)
    batch.update(packRef, product)
  })
  batch.commit()
}

export const editPrice = (packStore: PackStore, packStores: PackStore[], batch?: firebase.firestore.WriteBatch) => {
  const newBatch = batch || firebase.firestore().batch()
  const otherStores = packStores.filter(p => p.packId === packStore.packId && p.storeId !== packStore.storeId)
  otherStores.push(packStore)
  const stores = otherStores.map(p => {
    const {packId, ...others} = p
    return others
  })
  let packRef = firebase.firestore().collection('packs').doc(packStore.packId)
  newBatch.update(packRef, {
    stores
  })
  if (!batch) {
    newBatch.commit()
  }
}

export const deleteStorePack = (packStore: PackStore, packStores: PackStore[], packs: Pack[], batch?: firebase.firestore.WriteBatch) => {
  const newBatch = batch || firebase.firestore().batch()
  const pack = packs.find(p => p.id === packStore.packId)!
  const otherStores = packStores.filter(p => p.packId === packStore.packId && p.storeId !== packStore.storeId)
  const stores = otherStores.map(p => {
    const {packId, ...others} = p
    return others
  })
  let packRef = firebase.firestore().collection('packs').doc(pack.id)
  newBatch.update(packRef, {
    stores
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
  const values = countries.filter(c => c.id !== countryId)
  firebase.firestore().collection('lookups').doc('c').update({
    values
  })
}

export const editCountry = (country: Country, countries: Country[]) => {
  const values = countries.filter(c => c.id !== country.id)
  values.push(country)
  firebase.firestore().collection('lookups').doc('c').update({
    values
  })
}

export const addLocation = (location: Location) => {
  firebase.firestore().collection('lookups').doc('l').set({
    values: firebase.firestore.FieldValue.arrayUnion(location)
  }, {merge: true})
}

export const editLocation = (location: Location, locations: Location[]) => {
  const values = locations.filter(l => l.id !== location.id)
  values.push(location)
  firebase.firestore().collection('lookups').doc('l').update({
    values
  })
}

export const deleteLocation = (locationId: string, locations: Location[]) => {
  const values = locations.filter(l => l.id !== locationId)
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
  const values = trademarks.filter(t => t.id !== trademark.id)
  values.push(trademark)
  firebase.firestore().collection('lookups').doc('t').update({
    values
  })
}

export const deleteTrademark = (trademarkId: string, trademarks: Trademark[]) => {
  const values = trademarks.filter(t => t.id !== trademarkId)
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

export const addPack = async (pack: Pack, product: Product, users: User[], packRequests: PackRequest[], packRequest?: PackRequest, image?: File, subPackInfo?: Pack) => {
  const batch = firebase.firestore().batch()
  const packRef = firebase.firestore().collection('packs').doc()
  if (image) {
    const filename = image.name
    const ext = filename.slice(filename.lastIndexOf('.'))
    const fileData = await firebase.storage().ref().child('packs/' + packRef.id + ext).put(image)
    pack.imageUrl = await firebase.storage().ref().child(fileData.metadata.fullPath).getDownloadURL()
  }
  batch.set(packRef, {
    ...pack,
    product
  })
  if (packRequest) {
    const storeRef = firebase.firestore().collection('stores').doc(packRequest.storeId)
    const otherPackRequests = packRequests?.filter(r => r.storeId === packRequest.storeId && r.id !== packRequest.id)
    batch.update(storeRef, {
      packRequests: otherPackRequests
    })
    const user = users.find(u => u.storeId === packRequest.storeId)!
    sendNotification(user.id, labels.approval, `${labels.approveProduct} ${packRequest.name}`, batch)
    if (packRequest.imageUrl) {
      const ext = packRequest.imageUrl.slice(packRequest.imageUrl.lastIndexOf('.'), packRequest.imageUrl.indexOf('?'))
      const image = firebase.storage().ref().child('requests/' + packRequest.id + ext)
      await image.delete()
    }
  }
  batch.commit()
}

export const deletePack = (packId: string) => {
  firebase.firestore().collection('packs').doc(packId).delete()
}

export const editPack = async (newPack: Pack, packs: Pack[], image?: File) => {
  const batch = firebase.firestore().batch()
  const pack = {
    name: newPack.name,
    unitsCount: newPack.unitsCount,
    byWeight: newPack.byWeight,
    isActive: newPack.isActive,
    imageUrl: undefined,
    subPackId: newPack.subPackId,
    subCount: newPack.subCount,
  }
  if (image) {
    const filename = image.name
    const ext = filename.slice(filename.lastIndexOf('.'))
    const fileData = await firebase.storage().ref().child('packs/' + newPack.id + ext).put(image)
    pack.imageUrl = await firebase.storage().ref().child(fileData.metadata.fullPath).getDownloadURL()
  }
  if (!pack.imageUrl) delete pack.imageUrl
  if (!pack.subPackId) delete pack.subPackId
  if (!pack.subCount) delete pack.subCount
  const packRef = firebase.firestore().collection('packs').doc(newPack.id)
  batch.update(packRef, pack)
  let affectedPacks = packs.filter(p => p.subPackId === newPack.id)
  affectedPacks.forEach(p => {
    const packRef = firebase.firestore().collection('packs').doc(p.id)
    const packInfo = {
      unitsCount: p.subCount! * newPack.unitsCount!,
      byWeight: newPack.byWeight,
    }
    batch.update(packRef, packInfo)
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

export const deleteNotification = (user: User, notificationId: string, notifications: Notification[]) => {
  const otherNotifications = notifications.filter(n => n.userId === user.id && n.id !== notificationId)
  firebase.firestore().collection('users').doc(user.id).update({
    notifications: otherNotifications
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

export const permitUser = (user: User, type: string, storeName: string, locationId: string, address: string) => {
  const batch = firebase.firestore().batch()
  const userRef = firebase.firestore().collection('users').doc(user.id)
  if (user.type === 'n') {
    batch.update(userRef, {
      locationId,
    })
  } else {
    const store = {
      name: storeName,
      mobile: user.mobile,
      isActive: true,
      position: user.position,
      locationId,
      address,
      type
    }
    const storeRef = firebase.firestore().collection('stores').doc()
    batch.set(storeRef, store)
    batch.update(userRef, {
      storeId: storeRef.id,
      locationId,
      type
    })
    sendNotification(user.id, labels.approval, `${labels.permissionAdded} ${storeTypes.find(t => t.id === type)!.name}`, batch)
  }
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
    isActive: false
  })
  const affectedPacks = packs.filter(p => p.product.id === product.id)
  affectedPacks.forEach(p => {
    const packRef = firebase.firestore().collection('packs').doc(p.id)
    batch.update(packRef, {
      isActive: false,
      product: {
        ...product,
        isActive: false
      }
    })
  })
  batch.commit()
}

export const getArchivedProducts = async () => {
  let products: Product[] = []
  await firebase.firestore().collection('products')
          .where('isActive', '==', false)
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
                unit: doc.data().unit,
                imageUrl: doc.data().imageUrl,
                rating: doc.data().rating,
                ratingCount: doc.data().ratingCount,
                isActive: doc.data().isActive
              })
            })
          })
  return products
}

export const getArchivedPacks = async (productId: string) => {
  let packs: Pack[] = []
  await firebase.firestore().collection('packs')
          .where('product.id', '==', productId)
          .get().then(docs => {
            docs.forEach(doc => {
              packs.push({
                id: doc.id,
                name: doc.data().name,
                product: doc.data().product,
                imageUrl: doc.data().imageUrl,
                price: doc.data().price,
                byWeight: doc.data().byWeight,
                forSale: doc.data().forSale,
                weightedPrice: doc.data().weightedPrice,
                unitsCount: doc.data().unitsCount,
                isActive: doc.data().isActive,
                lastTrans: doc.data().lastTrans
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

export const rejectProductRequest = async (productRequest: ProductRequest, productRequests: ProductRequest[], users: User[]) => {
  const batch = firebase.firestore().batch()
  const storeRef = firebase.firestore().collection('stores').doc(productRequest.storeId)
  const otherProductRequests = productRequests.filter(r => r.storeId === productRequest.storeId && r.id !== productRequest.id)
  batch.update(storeRef, {
    productRequest: otherProductRequests
  })
  const user = users.find(u => u.storeId === productRequest.storeId)!
  sendNotification(user.id, labels.rejection, `${labels.rejectProduct} ${productRequest.name}`, batch)
  batch.commit()
  const ext = productRequest.imageUrl.slice(productRequest.imageUrl.lastIndexOf('.'), productRequest.imageUrl.indexOf('?'))
  const image = firebase.storage().ref().child('requests/' + productRequest.id + ext)
  await image.delete()
}

export const rejectPackRequest = async (packRequest: PackRequest, packRequests: PackRequest[], users: User[]) => {
  const batch = firebase.firestore().batch()
  const storeRef = firebase.firestore().collection('stores').doc(packRequest.storeId)
  const otherPackRequests = packRequests.filter(r => r.storeId === packRequest.storeId && r.id !== packRequest.id)
  batch.update(storeRef, {
    packRequests: otherPackRequests
  })
  const user = users.find(u => u.storeId === packRequest.storeId)!
  sendNotification(user.id, labels.rejection, `${labels.rejectProduct} ${packRequest.name}`, batch)
  batch.commit()
  if (packRequest.imageUrl) {
    const ext = packRequest.imageUrl.slice(packRequest.imageUrl.lastIndexOf('.'), packRequest.imageUrl.indexOf('?'))
    const image = firebase.storage().ref().child('requests/' + packRequest.id + ext)
    await image.delete()
  }
}

