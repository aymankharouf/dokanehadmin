
const functions = require('firebase-functions');
const admin = require('firebase-admin')
admin.initializeApp(functions.config().firebase)

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });


exports.rateProduct = functions.firestore.document('rating/{ratingId}')
  .onCreate(doc => {
    const productId = doc.data().productId
    const rating = doc.data().rating
    admin.firestore().collection('products').doc(productId).get()
      .then(product => {
        if (product.exists) {
          let prev_rating = product.data().rating
          let rating_count = product.data().rating_count
          if (!prev_rating) {
            prev_rating = 0
            rating_count = 0
          }
          const new_rating = (((prev_rating / 5 * rating_count) + rating) / (rating_count + 1)) * 5
          admin.firestore().collection('products').doc(product.id).update({
            rating: new_rating,
            rating_count: rating_count + 1
          })
        }
      })
  })

  exports.updateOrder = functions.firestore.document('orders/{orderId}')
  .onUpdate(change => {
    const newOrder = change.after.data()
    const oldOrder = change.before.data()
    if (newOrder.status === 'd' && oldOrder.status !== 'd'){
      const products = newOrder.basket
      for (const product of products) {
        admin.firestore().collection('products').doc(product.id).update({
          sales: admin.firestore.FieldValue.increment(product.quantity)
        })
      }
      const netPrice = newOrder.total + newOrder.fixedFees + newOrder.deliveryFees - (newOrder.customerDiscount + newOrder.specialDiscount)
      admin.firestore().collection('customers').doc(newOrder.user).update({
        totalPayments: admin.firestore.FieldValue.increment(netPrice)
      })
    }
  })

  exports.createCustomer = functions.auth.user().onCreate(user => {
    return admin.firestore().collection('customers').doc(user.uid).set({
      status: 'n',
      limit: 10,
      totalOrders: 0,
      totalPayments: 0,
      debit: 0,
      address: '',
      notes: '',
      withDelivery: false,
      deliveryFees: 0
    })
  });

