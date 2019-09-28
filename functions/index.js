
const functions = require('firebase-functions');
const admin = require('firebase-admin')
admin.initializeApp()

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
    var productRef = admin.firestore().collection("products").doc(productId);
    return admin.firestore().runTransaction(transaction => {
      // This code may get re-run multiple times if there are conflicts.
      return transaction.get(productRef).then(doc => {
        if (!doc.exists) {
            throw "Document does not exist!";
        }
        let prev_rating = product.data().rating
        let rating_count = product.data().rating_count
        if (!prev_rating) {
          prev_rating = 0
          rating_count = 0
        }
        const new_rating = (((prev_rating / 5 * rating_count) + rating) / (rating_count + 1)) * 5
        transaction.update(productRef, { rating: new_rating, rating_count: rating_count + 1 });
      })
    })
  })

  exports.deliveredOrder = functions.firestore.document('orders/{orderId}')
  .onUpdate(change => {
    const newOrder = change.after.data()
    const oldOrder = change.before.data()
    if (newOrder.status === 'r' && oldOrder.status !== 'r'){
      var batch = admin.firestore().batch()
      let packRef
      for (const pack of newOrder.basket) {
        productRef = admin.firestore().collection("packs").doc(pack.id)
        batch.update(packRef, {sales: admin.firestore.FieldValue.increment(pack.quantity)});
      }
      const netPrice = newOrder.total + newOrder.fixedFees + newOrder.deliveryFees - (newOrder.customerDiscount + newOrder.specialDiscount)
      const customerRef = admin.firestore().collection('customers').doc(newOrder.user)
      batch.update(customerRef, {
        totalPayments: admin.firestore.FieldValue.increment(netPrice),
        totalOrders: admin.firestore.FieldValue.increment(1),
        limit: admin.firestore.FieldValue.increment(5),
        registrationDiscount: newOrder.discountType === 'r' ? 0 : registrationDiscount,
        friendsDiscount: newOrder.discountType === 'f' ? admin.firestore.FieldValue.increment(-0.5) : friendsDiscount,
        lessPriceDiscount: newOrder.discountType === 'p' ? admin.firestore.FieldValue.increment(-0.5) : lessPriceDiscount
      })
      return batch.commit()
    }
  })

    