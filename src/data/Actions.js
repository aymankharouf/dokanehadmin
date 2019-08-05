import firebase from './firebase'

export const confirmOrder = async order => {
  const newOrder = {
    ...order,
    user: firebase.auth().currentUser.uid,
    status: 'a',
    time: new Date()
  }
  await firebase.firestore().collection('orders').add(newOrder)
}

export const addProduct = async (product, store, purchasePrice, price, offerEnd) => {
  const stores = [...product.stores, {id: store.id, purchasePrice, price, oldPurchasePrice: '', oldPrice: '', offerEnd, time: new Date()}]
  await firebase.firestore().collection('products').doc(product.id).update({
    stores: stores,
    status: 'a'
  })
}

export const newProduct = async product => {
  const stores = [{
    id: product.storeId, 
    purchasePrice: product.purchasePrice, 
    price: product.price, 
    oldPurchasePrice: '', 
    oldPrice: '',
    offerEnd: product.offerEnd,
    time: new Date()
  }]
  const docRef = await firebase.firestore().collection('products').add({
    category: product.category,
    name: product.name,
    stores: stores,
    sales: 0,
    rating: '',
    trademark: product.trademark,
    size: product.size,
    unit: product.unit,
    byWeight: product.byWeight,
    country: product.country,
    time: new Date(),
    status: 'a'
  })
  const filename = product.image.name
  const ext = filename.slice(filename.lastIndexOf('.'))
  const fileData = await firebase.storage().ref().child('products/' + docRef.id + ext).put(product.image)
  const url = await firebase.storage().ref().child(fileData.metadata.fullPath).getDownloadURL()
  return firebase.firestore().collection('products').doc(docRef.id).update({imageUrl: url})
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
  await firebase.firestore().collection('products').doc(product.id).update({
    category: product.category,
    name: product.name,
    trademark: product.trademark,
    size: product.size,
    unit: product.unit,
    byWeight: product.byWeight,
    country: product.country,
    imageUrl: url,
  })
}

export const editOrder = async order => {
  await firebase.firestore().collection("orders").doc(order.id).update({
    status: 'c'
  })
}

export const editPrice = async (store, product, purchasePrice, price, oldPurchasePrice, oldPrice, offerEnd) => {
  let stores = product.stores.filter(rec => rec.id !== store.id)
  stores = [...stores, {id: store.id, purchasePrice, price, oldPurchasePrice, oldPrice, offerEnd, time: new Date()}]
  await firebase.firestore().collection('products').doc(product.id).update({
    stores
  })
}


export const deleteProduct = async (store, product) => {
  const stores = product.stores.filter(rec => rec.id !== store.id)
  if (stores.length > 0) {
    await firebase.firestore().collection('products').doc(product.id).update({
      stores
    })
  } else {
    await firebase.firestore().collection('products').doc(product.id).update({
      stores: [],
      status: 'd'
    })
  }
}

export const confirmPrice = async (store, product) => {
  let stores = product.stores.filter(rec => rec.id !== store.id)
  const newStore = product.stores.find(rec => rec.id === store.id)
  stores = [...stores, {...newStore, time: new Date()}]
  await firebase.firestore().collection('products').doc(product.id).update({
    stores
  })
}

export const addStore = async store => {
  const docRef = await firebase.firestore().collection('stores').add(store)
  return docRef.id
}

export const addCountry = async country => {
  const docRef = await firebase.firestore().collection('countries').add(country)
  return docRef.id
}

export const addSection = async section => {
  const docRef = await firebase.firestore().collection('sections').add(section)
  return docRef.id
}

export const addCategory = async category => {
  const docRef = await firebase.firestore().collection('categories').add(category)
  return docRef.id
}

export const addTrademark = async trademark => {
  const docRef = await firebase.firestore().collection('trademarks').add(trademark)
  return docRef.id
}
