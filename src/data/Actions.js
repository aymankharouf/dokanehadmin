import firebase from './firebase'

export const confirmOrder = async order => {
  const newOrder = {
    ...order,
    user: firebase.auth().currentUser.uid,
    status: 1,
    time: new Date()
  }
  await firebase.firestore().collection('orders').add(newOrder)
}

export const addProduct = async (product, store, purchasePrice, price, inStock, offerPurchasePrice, offerPrice, offerEnd) => {
  const stores = [...product.stores, {id: store.id, purchasePrice, price, inStock, offerPurchasePrice, offerPrice, offerEnd, time: new Date()}]
  const minPrice = Math.min(...stores.map(store => store.price))
  await firebase.firestore().collection('products').doc(product.id).update({
    stores: stores,
    price: parseFloat(minPrice).toFixed(3),
    value: minPrice / product.quantity,
    status: 1
  })
}

export const newProduct = async product => {
  const stores = [{
    id: product.storeId, 
    purchasePrice: product.purchasePrice, 
    price: product.price, 
    inStock: product.inStock, 
    offerPurchasePrice: product.offerPurchasePrice, 
    offerPrice: product.offerPrice,
    offerEnd: product.offerEnd,
    time: new Date()
  }]
  const docRef = await firebase.firestore().collection('products').add({
    category: product.category,
    name: product.name,
    stores: stores,
    price: product.price,
    sales: 0,
    rating: '',
    value: product.price / product.quantity,
    trademark: product.trademark,
    quantity: product.quantity,
    unit: product.unit,
    byWeight: product.byWeight,
    country: product.country,
    time: new Date(),
    status: 1
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
    value: product.price / product.quantity,
    trademark: product.trademark,
    quantity: product.quantity,
    unit: product.unit,
    byWeight: product.byWeight,
    country: product.country,
    imageUrl: url,
  })
}

export const editOrder = async order => {
  await firebase.firestore().collection("orders").doc(order.id).update({
    status: 3
  })
}

export const editPrice = async (store, product, purchasePrice, price, inStock, offerPurchasePrice, offerPrice, offerEnd) => {
  let stores = product.stores.filter(rec => rec.id !== store.id)
  stores = [...stores, {id: store.id, purchasePrice, price, inStock, offerPurchasePrice, offerPrice, offerEnd, time: new Date()}]
  const minPrice = Math.min(...stores.map(store => store.price))
  await firebase.firestore().collection('products').doc(product.id).update({
    stores: stores,
    price: minPrice,
    value: minPrice / product.quantity,
  })
}


export const deleteProduct = async (store, product) => {
  const stores = product.stores.filter(rec => rec.id !== store.id)
  if (stores.length > 0) {
    const minPrice = Math.min(...stores.map(store => store.price))
    await firebase.firestore().collection('products').doc(product.id).update({
      stores: stores,
      price: minPrice,
      value: minPrice / product.quantity,
    })
  } else {
    await firebase.firestore().collection('products').doc(product.id).update({
      stores: [],
      price: 0,
      value: 0,
      status: 2
    })
  }
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
