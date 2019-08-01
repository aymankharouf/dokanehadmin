import firebase from './firebase'

export const rateProduct = (product, rating) => {
  const ratingRec = {
    productId: product.id,
    user: firebase.auth().currentUser.uid,
    rating: rating,
    time: new Date()
  }
  firebase.firestore().collection('rating').add(ratingRec)
}

export const confirmOrder = async order => {
  const newOrder = {
    ...order,
    user: firebase.auth().currentUser.uid,
    status: 1,
    time: new Date()
  }
  await firebase.firestore().collection('orders').add(newOrder)
}

export const addProduct = async storeProduct => {
  const stores = [...storeProduct.product.stores, {id: storeProduct.storeId, purchasePrice: parseFloat(storeProduct.purchasePrice).toFixed(3), price: parseFloat(storeProduct.price).toFixed(3), time: new Date()}]
  const minPrice = Math.min(...stores.map(store => store.price))
  await firebase.firestore().collection('products').doc(storeProduct.product.id).update({
    stores: stores,
    price: parseFloat(minPrice).toFixed(3),
    value: minPrice / storeProduct.product.quantity,
    status: 1
  })
}

export const newProduct = async product => {
  let id
  const stores = [{id: product.storeId, purchasePrice: parseFloat(product.purchasePrice).toFixed(3), price: parseFloat(product.price).toFixed(3), time: new Date()}]
  await firebase.firestore().collection('products').add({
    category: product.category,
    name: product.name,
    stores: stores,
    price: parseFloat(product.price).toFixed(3),
    sales: 0,
    rating: '',
    value: product.price / product.quantity,
    trademark: product.trademark,
    quantity: parseFloat(product.quantity),
    unit: product.unit,
    byWeight: product.byWeight,
    country: product.country,
    time: new Date(),
    status: 1
  }).then(docRef => {
      return docRef.id
    }).then(key => {
      const filename = product.image.name
      const ext = filename.slice(filename.lastIndexOf('.'))
      id = key
      return firebase.storage().ref().child('products/' + key + ext).put(product.image)
    }).then(fileData => {
      return firebase.storage().ref().child(fileData.metadata.fullPath).getDownloadURL()
    }).then(url => {
      return firebase.firestore().collection('products').doc(id).update({imageUrl: url})
    })
}

export const editProduct = async product => {
  let url
  if (product.image) {
    const filename = product.image.name
    const ext = filename.slice(filename.lastIndexOf('.'))
    const fileData = await firebase.storage().ref().child('products/' + product.id + ext).put(product.image)
    url = firebase.storage().ref().child(fileData.metadata.fullPath).getDownloadURL()
  } else {
    url = product.imageUrl
  }
  await firebase.firestore().collection('products').doc(product.id).update({
    category: product.category,
    name: product.name,
    value: product.price / product.quantity,
    trademark: product.trademark,
    quantity: parseFloat(product.quantity),
    unit: product.unit,
    byWeight: product.byWeight,
    country: product.country,
    imageUrl: url
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
  await firebase.firestore().collection('stores').add(store)
}



