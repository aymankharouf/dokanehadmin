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
    {id: 'r', name: 'مرفوض'},
    {id: 'e', name: 'قيد التجهيز'},
    {id: 'f', name: 'جاهز للاستلام'},
    {id: 'b', name: 'جاهز للتوصيل'},
    {id: 'd', name: 'تم اﻻستلام'},
    {id: 'c', name: 'ملغي'},
    {id: 'i', name: 'استيداع'}
  ]  
  const storeTypes = [
    {id: 'i', name: 'مستودع'},
    {id: 'm', name: 'محل'},
    {id: 's', name: 'سوبرماركت'},
    {id: 'w', name: 'محل جملة'}
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
    invalidFile: 'الرجاء التأكد من ملف الصورة'
  }
  const localData = localStorage.getItem('basket');
  const basket = localData ? JSON.parse(localData) : ''
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [stockTrans, setStockTrans] = useState([]);
  const [lessPrice, setLessPrice] = useState([]);
  let countries = []
  let stores = []
  let sections = []
  let categories = []
  let trademarks = []
  const initState = {
    sections, 
    randomColors, 
    categories, 
    countries, 
    stores, 
    labels, 
    orderStatus, 
    basket, 
    trademarks, 
    orderByList, 
    storeTypes
  }
  const [state, dispatch] = useReducer(Reducer, initState)
  useEffect(() => {
    firebase.auth().onAuthStateChanged(user => {
      setUser(user)
      if (user){
        firebase.firestore().collection('orders').onSnapshot(docs => {
          let ordersArray = []
          docs.forEach(doc => {
            ordersArray.push({...doc.data(), id:doc.id})
          })
          setOrders(ordersArray)
        })  
        firebase.firestore().collection('users').onSnapshot(docs => {
          let usersArray = []
          docs.forEach(doc => {
            usersArray.push({...doc.data(), id:doc.id})
          })
          setUsers(usersArray)
        })  
        firebase.firestore().collection('stores').get().then(docs => {
          docs.forEach(doc => {
            dispatch({type: 'ADD_STORE', store: {...doc.data(), id:doc.id}})
          })
        })  
        firebase.firestore().collection('purchases').onSnapshot(docs => {
          let purchasessArray = []
          docs.forEach(doc => {
            purchasessArray.push({...doc.data(), id:doc.id})
          })
          setPurchases(purchasessArray)
        })  
        firebase.firestore().collection('stockTrans').onSnapshot(docs => {
          let stockTransArray = []
          docs.forEach(doc => {
            stockTransArray.push({...doc.data(), id:doc.id})
          })
          setStockTrans(stockTransArray)
        })  
        firebase.firestore().collection('lessPrice').onSnapshot(docs => {
          let lessPriceArray = []
          docs.forEach(doc => {
            lessPriceArray.push({...doc.data(), id:doc.id})
          })
          setLessPrice(lessPriceArray)
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
      let productsArray = []
      docs.forEach(doc => {
        const minPrice = Math.min(...doc.data().stores.map(store => !store.offerEnd || new Date() <= store.offerEnd.toDate() ? store.price : store.oldPrice))
        productsArray.push({...doc.data(), id: doc.id, price: minPrice})
      })
      setProducts(productsArray)
    })
  }, []);
  return (
    <StoreContext.Provider value={{state, user, products, users, orders, purchases, stockTrans, lessPrice, dispatch}}>
      {props.children}
    </StoreContext.Provider>
  );
}
 
export default Store;

