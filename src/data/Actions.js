import firebase from './firebase'

export const confirmPurchase = async purchase => {
  await firebase.firestore().collection('purchases').add(purchase)
}

export const updateOrder = async order => {
  await firebase.firestore().collection('orders').doc(order.id).update({
    basket: order.basket,
    status: order.status
  })
}

export const stockIn = async (product, stock, quantity) => {
  const otherStores = product.stores.filter(rec => rec.id !== stock.id)
  const found = product.stores.find(rec => rec.id === stock.id)
  const quantityInStck = found ? found.quantity : 0
  const grossPrice = found ? found.quantity * found.price : 0
  const avgPrice = (grossPrice + (quantity * product.actualPrice)) / (quantity + quantityInStck)
  const grossPurchasePrice = found ? found.quantity * found.purchasePrice : 0
  const avgPurchasePrice = (grossPurchasePrice + (quantity * product.purchasePrice)) / (quantity + quantityInStck)
  await firebase.firestore().collection('products').doc(product.id).update({
    stores: [...otherStores, {id: stock.id, price: avgPrice, purchasePrice: avgPurchasePrice, quantity: quantity + quantityInStck, time: new Date()}]
  })
  const docRef = await firebase.firestore().collection('stockTrans').add({
    productId: product.id,
    quantity: quantity,
    pirce: product.actualPrice,
    purchasePrice: product.purchasePrice,
    time: new Date()
  })
  return docRef.id
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
    name: product.name,
    description: product.description,
    category: product.category,
    trademark: product.trademark,
    country: product.country,
    stores: stores,
    sales: 0,
    rating: '',
    byWeight: product.byWeight,
    isNew: product.isNew,
    isOffer: product.isOffer,
    time: new Date(),
    status: 'a'
  })
  const filename = product.image.name
  const ext = filename.slice(filename.lastIndexOf('.'))
  const fileData = await firebase.storage().ref().child('products/' + docRef.id + ext).put(product.image)
  const url = await firebase.storage().ref().child(fileData.metadata.fullPath).getDownloadURL()
  await firebase.firestore().collection('products').doc(docRef.id).update({imageUrl: url})
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
    name: product.name,
    description: product.description,
    category: product.category,
    trademark: product.trademark,
    byWeight: product.byWeight,
    isNew: product.isNew,
    isOffer: product.isOffer,
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
