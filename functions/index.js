
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
          admin.firestore().collection('products').doc(product.id).set({
            rating: new_rating,
            rating_count: rating_count + 1
          }, { merge: true })
        }
      })
  })

exports.confirmOrder = functions.firestore.document('orders/{orderId}')
  .onCreate(doc => {
    doc.data().basket.map(product => {
      admin.firestore().collection('purshase').where('product.id', '==', product.id).where('isDone', '==', 'false').get()
        .then(querySnapshot => {
          let i = 0
          querySnapshot.forEach(purshase => {
            i++
            admin.firestore().collection('purshase').doc(purshase.id).set({
              amount: purshase.data().amount + product.quantity
              }, { merge: true })
          })
          if (i === 0) {
						admin.firestore().collection('purshase').add({
							product: product,
							amount: product.quantity,
							isDone: 'false',
							time: new Date()
						})
					}
				})
		})
  })
  
  exports.createCustomer = functions.auth.user().onCreate(user => {
    return admin.firestore().collection('customers').doc(user.uid).set({
      mobile: user.email.substring(0, 10),
      status: 1,
      limit: 10,
      totalOrders: 0,
      totalPayment: 0,
      debit: 0,
      time: new Date,
      address: '',
      notes: ''
    })
  });

