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
  const stores = [...storeProduct.product.stores, {id: storeProduct.storeId, price: parseFloat(storeProduct.price).toFixed(3), time: new Date()}]
  const minPrice = Math.min(...stores.map(store => store.price))
  await firebase.firestore().collection('products').doc(storeProduct.product.id).set({
    stores: stores,
    price: parseFloat(minPrice).toFixed(3),
    value: minPrice / storeProduct.product.quantity,
  }, { merge: true })
}

export const newProduct = async product => {
  let id
  const stores = [{id: product.storeId, price: parseFloat(product.price).toFixed(3), time: new Date()}]
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
    time: new Date()
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
      return firebase.firestore().collection('products').doc(id).set({imageUrl: url}, { merge: true})
    })
}

export const editOrder = async order => {
  await firebase.firestore().collection("orders").doc(order.id).set({
    status: 3
  }, { merge: true })
}

export const editPrice = async (storeId, product, price) => {
  let stores = product.stores.filter(store => store.id !== storeId)
  stores = [...stores, {id: storeId, price: parseFloat(price).toFixed(3), time: new Date()}]
  const minPrice = Math.min(...stores.map(store => store.price))
  await firebase.firestore().collection('products').doc(product.id).set({
    stores: stores,
    price: parseFloat(minPrice).toFixed(3),
    value: minPrice / product.quantity,
  }, { merge: true })
}


export const deleteProduct = async (storeId, product) => {
  const stores = product.stores.filter(store => store.id !== storeId)
  const minPrice = (stores.length > 0) ? Math.min(...stores.map(store => store.price)) : 0
  await firebase.firestore().collection('products').doc(product.id).set({
    stores: stores,
    price: parseFloat(minPrice).toFixed(3),
    value: minPrice / product.quantity,
  }, { merge: true })
}



