
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'
import 'firebase/storage'

var config = {
  apiKey: process.env.REACT_APP_FIREBASE_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.envREACT_APP_FIREBASE_APP_ID
}
firebase.initializeApp(config)
firebase.firestore().enablePersistence()
.catch(function(err) {
  if (err.code === 'failed-precondition') {
    alert('حدث خطأ في عملية حفظ البيانات اثناء انقطاع انترنت')
  } else if (err.code === 'unimplemented') {
    alert('لتفعيل كامل مميزات هذا الموقع، يرجى التصفح باستخدام احد المتصفحات التالية: كروم، فايرفوكس، سفاري')
  }
})
export default firebase
