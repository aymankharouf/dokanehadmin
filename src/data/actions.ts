import firebase from './firebase'
import labels from './labels'
import {colors, userTypes} from './config'
import {Advert, Category, Country, Error, Region, Log, Pack, PackRequest, PackStore, Product, ProductRequest, Store, Trademark, User, Position} from './types'

export const getMessage = (path: string, error: Error) => {
  const errorCode = error.code ? error.code.replace(/-|\//g, '_') : error.message
  if (!labels[errorCode]) {
    firebase.firestore().collection('logs').add({
      userId: firebase.auth().currentUser?.uid,
      error: errorCode,
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

export const getStoreName = (store: Store, regions: Region[]) => {
  return `${store.name}${store.regionId ? '-' + regions.find(r => r.id === store.regionId)!.name : ''}${store.type === 's' ? '' : '(' + userTypes.find(t => t.id === store.type)!.name + ')'}`
}

export const login = (email: string, password: string) => {
  return firebase.auth().signInWithEmailAndPassword(email, password)
}

export const logout = () => {
  firebase.auth().signOut()
}

export const addPackStore = async (packStore: PackStore, packs: Pack[]) => {
  const {packId, ...others} = packStore
  const pack = packs.find(p => p.id === packId)!
  let packRef = firebase.firestore().collection('packs').doc(pack.id)
  packRef.update({
    stores: firebase.firestore.FieldValue.arrayUnion(others),
    isActive: true,
    lastTrans: new Date()
  })
}

export const addProduct = async (product: Product, image?: File) => {
  const productRef = firebase.firestore().collection('products').doc()
  if (image) {
    const filename = image.name
    const ext = filename.slice(filename.lastIndexOf('.'))
    const fileData = await firebase.storage().ref().child('products/' + productRef.id + ext).put(image)
    product.imageUrl = await firebase.storage().ref().child(fileData.metadata.fullPath).getDownloadURL()
  }
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

export const editProduct = async (product: Product, packs: Pack[], image?: File) => {
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
    batch.update(packRef, {product})
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

export const deleteStorePack = (packStore: PackStore, packs: Pack[], packStores: PackStore[], batch?: firebase.firestore.WriteBatch) => {
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
  const storeRef = firebase.firestore().collection('stores').doc()
  storeRef.set(store)
}

export const editStore = (store: Store) => {
  const {id, ...others} = store
  const storeRef = firebase.firestore().collection('stores').doc(id)
  storeRef.update(others)
}

export const changeStoreStatus = (store: Store, users: User[], packStores: PackStore[]) => {
  const batch = firebase.firestore().batch()
  const storeRef = firebase.firestore().collection('stores').doc(store.id)
  batch.update(storeRef, {
    isActive: !store.isActive
  })
  const storeOwner = users.find(u => u.storeId === store.id)
  if (storeOwner) {
    const userRef = firebase.firestore().collection('users').doc(storeOwner.id)
    batch.update(userRef, {
      isActive: !store.isActive
    })
  }
  const affectedPackStores = packStores.filter(p => p.storeId === store.id)
  affectedPackStores.forEach(p => {
    const otherStores = packStores.filter(s => s.packId === p.packId && s.storeId !== p.storeId)
    otherStores.push({
      ...p,
      isActive: !store.isActive
    })
    const stores = otherStores.map(p => {
      const {packId, ...others} = p
      return others
    })
    const packRef = firebase.firestore().collection('packs').doc(p.packId)
    batch.update(packRef, {
      stores
    })
  })
  batch.commit()
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

export const addRegion = (region: Region) => {
  firebase.firestore().collection('lookups').doc('r').set({
    values: firebase.firestore.FieldValue.arrayUnion(region)
  }, {merge: true})
}

export const editRegion = (region: Region, regions: Region[]) => {
  const values = regions.filter(r => r.id !== region.id)
  values.push(region)
  firebase.firestore().collection('lookups').doc('r').update({
    values
  })
}

export const deleteRegion = (regionId: string, regions: Region[]) => {
  const values = regions.filter(r => r.id !== regionId)
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

export const addCategory = (category: Category) => {
  const batch = firebase.firestore().batch()
  let categoryRef
  if (category.parentId !== '0') {
    categoryRef = firebase.firestore().collection('categories').doc(category.parentId)
    batch.update(categoryRef, {
      isLeaf: false
    })
  }
  categoryRef = firebase.firestore().collection('categories').doc()
  batch.set(categoryRef, category)
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
    const mainCategory = categories.find(c => c.id === category.mainId)
    return mainCategory?.name + '-' + category.name
  }
}

export const resolvePasswordRequest = (requestId: string) => {
  firebase.firestore().collection('password-requests').doc(requestId).delete()
}

export const addPack = async (pack: Pack, product: Product, image?: File) => {
  const packRef = firebase.firestore().collection('packs').doc()
  if (image) {
    const filename = image.name
    const ext = filename.slice(filename.lastIndexOf('.'))
    const fileData = await firebase.storage().ref().child('packs/' + packRef.id + ext).put(image)
    pack.imageUrl = await firebase.storage().ref().child(fileData.metadata.fullPath).getDownloadURL()
  }
  packRef.set({
    ...pack,
    product
  })
}

export const deletePack = (packId: string) => {
  firebase.firestore().collection('packs').doc(packId).delete()
}

export const editPack = async (pack: Pack, packs: Pack[], image?: File) => {
  const batch = firebase.firestore().batch()
  let imageUrl = pack.imageUrl
  if (image) {
    const filename = image.name
    const ext = filename.slice(filename.lastIndexOf('.'))
    const fileData = await firebase.storage().ref().child('packs/' + pack.id + ext).put(image)
    imageUrl = await firebase.storage().ref().child(fileData.metadata.fullPath).getDownloadURL()
  }
  const {price, weightedPrice, ...others} = pack
  const packRef = firebase.firestore().collection('packs').doc(pack.id)
  batch.update(packRef, {
    ...others,
    imageUrl
  })
  const affectedPacks = packs.filter(p => p.subPackId === pack.id)
  affectedPacks.forEach(p => {
    const packRef = firebase.firestore().collection('packs').doc(p.id)
    const packInfo = {
      unitsCount: p.subCount! * pack.unitsCount!,
      byWeight: pack.byWeight,
    }
    batch.update(packRef, packInfo)
  })
  batch.commit()
}

export const deleteUser = async (user: User) => {
  if (!user.colors) return
  const userColors = user.colors.split(' ')
  const numbers = userColors.map(c => colors.find(rc => rc.name === c)?.id)
  const password = numbers.join('')
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

export const sendNotification = (userId: string, title: string, message: string, batch?: firebase.firestore.WriteBatch) => {
  const newBatch =  batch || firebase.firestore().batch()
  const userRef = firebase.firestore().collection('users').doc(userId)
  newBatch.update(userRef, {
    notifications: firebase.firestore.FieldValue.arrayUnion({
      id: Math.random().toString(),
      userId: null,
      userName: labels.admin,
      title,
      message,
      isResponse: false,
      time: new Date()
    })
  })
  if (!batch) {
    newBatch.commit()
  }
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

export const permitUser = (user: User, type: string, storeName: string, regionId: string, address: string, position: Position) => {
  const batch = firebase.firestore().batch()
  const userRef = firebase.firestore().collection('users').doc(user.id)
  const storeRef = firebase.firestore().collection('stores').doc()
  if (type === 'd') {
    batch.set(storeRef, {
      name: user.name,
      mobile: user.mobile,
      isActive: true,
      type,
      position,
      ownerID: userRef.id
    })
    batch.update(userRef, {
      storeId: storeRef.id,
      type,
      position,
      isActive: true
    })  
  } else {
    batch.set(storeRef, {
      name: storeName,
      mobile: user.mobile,
      isActive: true,
      position,
      regionId,
      address,
      type,
      claimsCount: 0,
      ownerId: userRef.id
    })
    batch.update(userRef, {
      storeId: storeRef.id,
      regionId,
      type,
      position,
      isActive: true
    })  
  }
  sendNotification(user.id, labels.approval, `${labels.permissionAdded} ${userTypes.find(t => t.id === type)!.name}`, batch)
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
                byWeight: doc.data().byWeight,
                forSale: doc.data().forSale,
                withGift: doc.data().withGift,
                gift: doc.data().gift,
                subCount: doc.data().subCount,
                subPackId: doc.data().subPackId,
                unitsCount: doc.data().unitsCount,
                isActive: doc.data().isActive,
                lastTrans: doc.data().lastTrans
              })
            })
          })
  return packs
}

export const categoryChildren = (categoryId: string, categories: Category[]) => {
  let result = [categoryId]
  const children = categories.filter(c => c.parentId === categoryId)
  for (let child of children) {
    const childrenArray = categoryChildren(child.id!, categories)
    result.push(...childrenArray)
  }
  return result
}

export const resolveProductRequest = async (type: string, productRequest: ProductRequest, productRequests: ProductRequest[], users: User[]) => {
  const batch = firebase.firestore().batch()
  const storeRef = firebase.firestore().collection('stores').doc(productRequest.storeId)
  const otherProductRequests = productRequests.filter(r => r.storeId === productRequest.storeId && r.id !== productRequest.id)
  batch.update(storeRef, {
    productRequests: otherProductRequests
  })
  const user = users.find(u => u.storeId === productRequest.storeId)!
  const notificationTitle = type === 'a' ? labels.approval : labels.rejection
  const notificationText = type === 'a' ? `${labels.approveProduct} ${productRequest.name}` : `${labels.rejectProduct} ${productRequest.name}`
  sendNotification(user.id, notificationTitle, notificationText, batch)
  batch.commit()
  const ext = productRequest.imageUrl.slice(productRequest.imageUrl.lastIndexOf('.'), productRequest.imageUrl.indexOf('?'))
  const image = firebase.storage().ref().child('requests/' + productRequest.id + ext)
  await image.delete()
}

export const resolvePackRequest = async (type: string, packRequest: PackRequest, packRequests: PackRequest[], users: User[]) => {
  const batch = firebase.firestore().batch()
  const storeRef = firebase.firestore().collection('stores').doc(packRequest.storeId)
  const otherPackRequests = packRequests.filter(r => r.storeId === packRequest.storeId && r.id !== packRequest.id)
  batch.update(storeRef, {
    packRequests: otherPackRequests
  })
  const user = users.find(u => u.storeId === packRequest.storeId)!
  const notificationTitle = type === 'a' ? labels.approval : labels.rejection
  const notificationText = type === 'a' ? `${labels.approveProduct} ${packRequest.name}` : `${labels.rejectProduct} ${packRequest.name}`
  sendNotification(user.id, notificationTitle, notificationText, batch)
  batch.commit()
  if (packRequest.imageUrl) {
    const ext = packRequest.imageUrl.slice(packRequest.imageUrl.lastIndexOf('.'), packRequest.imageUrl.indexOf('?'))
    const image = firebase.storage().ref().child('requests/' + packRequest.id + ext)
    await image.delete()
  }
}

export const linkOwner = (user: User, store: Store) => {
  const batch = firebase.firestore().batch()
  const userRef = firebase.firestore().collection('users').doc(user.id)
  batch.update(userRef, {
    storeId: store.id,
    regionId: store.regionId,
    type: store.type
  })
  const storeRef = firebase.firestore().collection('stores').doc(store.id)
  batch.update(storeRef, {
    ownerId: user.id
  })
  sendNotification(user.id, labels.approval, `${labels.permissionAdded} ${userTypes.find(t => t.id === store.type)!.name}`, batch)
  batch.commit()
}