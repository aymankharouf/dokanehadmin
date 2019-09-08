import React, { createContext, useReducer, useEffect, useState } from 'react';
import Reducer from './Reducer'
import firebase from './firebase'

export const StoreContext = createContext()

const Store = props => {
  
  const randomColors = [
    {id: '0', name: 'red'},
    {id: '1', name: 'green'},
    {id: '2', name: 'blue'},
    {id: '3', name: 'pink'},
    {id: '4', name: 'yellow'},
    {id: '5', name: 'orange'},
    {id: '6', name: 'purple'},
    {id: '7', name: 'deeppurple'},
    {id: '8', name: 'lightblue'},
    {id: '9', name: 'teal'},
    {id: '10', name: 'lime'},
    {id: '11', name: 'deeporange'},
    {id: '12', name: 'gray'}
  ]
  const orderByList = [
    {id: 'p', name: 'السعر'},
    {id: 's', name: 'المبيعات'},
    {id: 'r', name: 'التقييم'}
  ]
  const orderStatus = [
    {id: 'n', name: 'جديد'},
    {id: 'a', name: 'معتمد'},
    {id: 's', name: 'معلق'},
    {id: 'u', name: 'مرفوض'},
    {id: 'e', name: 'قيد التجهيز'},
    {id: 'f', name: 'جاهز'},
    {id: 'd', name: 'جاهز للاستلام'},
    {id: 'b', name: 'جاهز للتوصيل'},
    {id: 'r', name: 'تم اﻻستلام'},
    {id: 'c', name: 'ملغي'},
    {id: 'i', name: 'استيداع'}
  ]  
  const storeTypes = [
    {id: 'm', name: 'محل'},
    {id: 's', name: 'سوبرماركت'},
    {id: 'w', name: 'محل جملة'}
  ]
  const stockTransTypes = [
    {id: 'p', name: 'شراء'},
    {id: 's', name: 'بيع'},
    {id: 'r', name: 'ارجاع'}
  ]
  const labels = {
    appTitle: 'حريص',
    news: 'آخر الاخبار',
    offers: 'العروض',
    popular: 'اﻻكثر مبيعا',
    registerTitle: 'التسجيل ﻷول مرة',
    name: 'اﻻسم',
    mobile: 'الموبايل',
    password: 'كلمة السر',
    location: 'الموقع',
    register: 'تسجيل',
    error: 'خطأ',
    noData: 'ﻻ يوجد بيانات',
    search: 'بحث',
    auth_user_not_found: 'الرجاء التأكد من رقم الموبايل وكلمة المرور',
    auth_email_already_in_use: 'لقد سجلت سابقا برقم هذا الموبايل',
    auth_wrong_password: 'كلمة السر غير صحيحة',
    orderDetails: 'تفاصيل الطلب',
    productOf: 'انتاج',
    basket_from: 'سلة المشتريات من',
    stock:'المستودع',
    purchaseDetails: 'تفاصيل المشتريات',
    purchases: 'المشتريات',
    category: 'التصنيف',
    trademark: 'العلامة التجارية',
    country: 'الدولة',
    description: 'الوصف',
    isNew: 'جديد؟',
    byWeight: 'بالوزن؟',
    isOffer: 'عرض؟',
    purchasePrice: 'سعر الشراء',
    price: 'السعر',
    offerEnd: 'تاريخ انتهاء العرض',
    stores: 'المحال التجارية',
    newProduct: 'منتج جديد',
    existProduct: 'منتج موجود',
    image: 'الصورة',
    submit: 'موافق',
    orderBy: 'الترتيب حسب',
    allProducts: 'كل المنتجات',
    product: 'المنتج',
    addProduct: 'اضافة منتج',
    new: 'جديد',
    offer: 'عرض',
    editProduct: 'تعديل منتج',
    editPrice: 'تعديل سعر',
    orders: 'الطلبات',
    confirmPurchase: 'اعتماد الشراء',
    total: 'المجموع',
    RequestedProducts: 'المنتجات المطلوبة',
    newStore: 'محل جديد',
    type: 'النوع',
    address: 'العنوان',
    confirm: 'اعتماد',
    fixedFees: 500,
    feesTitle: 'الرسوم',
    discount: 'الخصم',
    net: 'الصافي',
    delivery: 'خدمة التوصيل',
    deliveryFees: 'رسوم التوصيل',
    cost: 'التكلفة',
    profit: 'الربح',
    enterName: 'الرجاء ادخال الاسم',
    enterDescription: 'الرجاء ادخال الشرح',
    enterPurchasePrice: 'الرجاء ادخال سعر الشراء',
    enterPrice: 'الرجاء ادخال السعر',
    enterCategory: 'الرجاء ادخال التصنيف',
    enterCountry: 'الرجاء ادخال بلد المنشأ',
    enterImage: 'الرجاء ادخال صورة',
    invalidPrice: 'الرجاء التأكد من السعر',
    invalidOfferEnd: 'الرجاء التأكد من تاريخ انتهاء العرض',
    chooseProduct: 'الرجاء اختيار منتج',
    enterPercent: 'الرجاء ادخال النسبة',
    invalidMobile: 'رقم الموبايل غير صحيح',
    twoDiffStores: 'ﻻ يمكن التسوق من محلين مختلفين في نفس الوقت',
    invalidFile: 'الرجاء التأكد من ملف الصورة',
    stockTrans: 'حركات المستودع',
    stockTransDetails: 'تفاصيل حركة المستودع',
    stockName: 'المستودع',
    editOrder: 'تعديل طلب',
    forgetPassword: 'طلبات نسيان كلمة السر',
    customers: 'العملاء'
  }
  const localData = localStorage.getItem('basket');
  const basket = localData ? JSON.parse(localData) : ''
  const [user, setUser] = useState(null);
  const initState = {
    sections: [], 
    randomColors, 
    categories: [], 
    countries: [], 
    stores: [], 
    labels, 
    orderStatus, 
    basket, 
    trademarks: [], 
    orderByList, 
    storeTypes,
    stockTransTypes,
    users: [],
    purchases: [],
    orders: [],
    lessPrice: [],
    productTrans: [],
    stockTrans: [],
    products: [],
    forgetPassword: []
  }
  const [state, dispatch] = useReducer(Reducer, initState)
  useEffect(() => {
    firebase.auth().onAuthStateChanged(user => {
      setUser(user)
      if (user){
        firebase.firestore().collection('orders').onSnapshot(docs => {
          let orders = []
          docs.forEach(doc => {
            orders.push({...doc.data(), id:doc.id})
          })
          dispatch({type: 'SET_ORDERS', orders})
        })  
        firebase.firestore().collection('users').onSnapshot(docs => {
          let users = []
          docs.forEach(doc => {
            users.push({...doc.data(), id:doc.id})
          })
          dispatch({type: 'SET_USERS', users})
        })  
        firebase.firestore().collection('stores').get().then(docs => {
          docs.forEach(doc => {
            dispatch({type: 'ADD_STORE', store: {...doc.data(), id:doc.id}})
          })
        })
        firebase.firestore().collection('purchases').onSnapshot(docs => {
          let purchases = []
          docs.forEach(doc => {
            purchases.push({...doc.data(), id:doc.id})
          })
          dispatch({type: 'SET_PURCHASES', purchases})
        })  
        firebase.firestore().collection('stockTrans').onSnapshot(docs => {
          let stockTrans = []
          docs.forEach(doc => {
            stockTrans.push({...doc.data(), id:doc.id})
          })
          dispatch({type: 'SET_STOCK_TRANS', stockTrans})
        })  
        firebase.firestore().collection('productTrans').onSnapshot(docs => {
          let productTrans = []
          docs.forEach(doc => {
            productTrans.push({...doc.data(), id:doc.id})
          })
          dispatch({type: 'SET_PRODUCT_TRANS', productTrans})
        })  
        firebase.firestore().collection('lessPrice').onSnapshot(docs => {
          let lessPrice = []
          docs.forEach(doc => {
            lessPrice.push({...doc.data(), id:doc.id})
          })
          dispatch({type: 'SET_LESS_PIRCE', lessPrice})
        })
        firebase.firestore().collection('forgetPassword').onSnapshot(docs => {
          let forgetPassword = []
          docs.forEach(doc => {
            forgetPassword.push({...doc.data(), id:doc.id})
          })
          dispatch({type: 'SET_FORGET_PASSWORD', forgetPassword})
        })
      }
    })
    firebase.firestore().collection('sections').get().then(docs => {
      docs.forEach(doc => {
        dispatch({type: 'ADD_SECTION', section: {...doc.data(), id:doc.id}})
      })
    })  
    firebase.firestore().collection('categories').get().then(docs => {
      docs.forEach(doc => {
        dispatch({type: 'ADD_CATEGORY', category: {...doc.data(), id:doc.id}})
      })
    })  
    firebase.firestore().collection('trademarks').get().then(docs => {
      docs.forEach(doc => {
        dispatch({type: 'ADD_TRADEMARK', trademark: {...doc.data(), id:doc.id}})
      })
    })  
    firebase.firestore().collection('countries').get().then(docs => {
      docs.forEach(doc => {
        dispatch({type: 'ADD_COUNTRY', country: {...doc.data(), id:doc.id}})
      })
    })  
    firebase.firestore().collection('products').onSnapshot(docs => {
      let products = []
      docs.forEach(doc => {
        const minPrice = Math.min(...doc.data().stores.map(store => !store.offerEnd || new Date() <= store.offerEnd.toDate() ? store.price : store.oldPrice))
        products.push({...doc.data(), id: doc.id, price: minPrice})
      })
      dispatch({type: 'SET_PRODUCTS', products})
    })
  }, []);
  return (
    <StoreContext.Provider value={{state, user, dispatch}}>
      {props.children}
    </StoreContext.Provider>
  );
}
 
export default Store;

