import React, { createContext, useReducer, useEffect, useState } from 'react';
import Reducer from './Reducer'
import firebase from './firebase'
import labels from './labels'

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
  const unitTypes = [
    {id: 'w', name: 'وزن'},
    {id: 'v', name: 'حجم'},
    {id: 'l', name: 'طول'}
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
    {id: 's', name: 'دكانة'},
    {id: 'm', name: 'محل'},
    {id: 'b', name: 'سوبرماركت'},
    {id: 'w', name: 'محل جملة'}
  ]
  const stockTransTypes = [
    {id: 'p', name: 'شراء'},
    {id: 's', name: 'بيع'},
    {id: 'r', name: 'ارجاع'}
  ]
  const customerTypes = [
    {id: 'n', name: 'عادي'},
    {id: 'o', name: 'صاحب محل'},
    {id: 'b', name: 'قائمة سوداء'},
    {id: 'v', name: 'مميز'},
    {id: 's', name: 'خاص'}
  ]
  const discountTypes = [
    {id: 'f', name: 'خصم اول طلب'},
    {id: 's', name: 'خصم خاص'},
    {id: 'i', name: 'خصم دعوة صديق'},
    {id: 'l', name: 'خصم ابلاغ عن سعر اقل'}
  ]

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
    priceAlarms: [],
    packTrans: [],
    stockTrans: [],
    products: [],
    packs: [],
    forgetPassword: [],
    unitTypes,
    customerTypes,
    customers: [],
    discountTypes
  }
  const [state, dispatch] = useReducer(Reducer, initState)
  useEffect(() => {
    firebase.auth().onAuthStateChanged(user => {
      setUser(user)
      if (user){
        const unsubscribeOrders = firebase.firestore().collection('orders').onSnapshot(docs => {
          let orders = []
          docs.forEach(doc => {
            orders.push({...doc.data(), id:doc.id})
          })
          dispatch({type: 'SET_ORDERS', orders})
        }, err => {
          unsubscribeOrders()
        })  
        const unsubscribeUsers = firebase.firestore().collection('users').onSnapshot(docs => {
          let users = []
          docs.forEach(doc => {
            users.push({...doc.data(), id:doc.id})
          })
          dispatch({type: 'SET_USERS', users})
        }, err => {
          unsubscribeUsers()
        })  
        const unsubscribeCustomers = firebase.firestore().collection('customers').onSnapshot(docs => {
          let customers = []
          docs.forEach(doc => {
            customers.push({...doc.data(), id:doc.id})
          })
          dispatch({type: 'SET_CUSTOMERS', customers})
        }, err => {
          unsubscribeCustomers()
        })  
        const unsubscribeStores = firebase.firestore().collection('stores').onSnapshot(docs => {
          let stores = []
          docs.forEach(doc => {
            stores.push({...doc.data(), id:doc.id})
          })
          dispatch({type: 'SET_STORES', stores})
        }, err => {
          unsubscribeStores()
        })  
        const unsubscribePurchases = firebase.firestore().collection('purchases').onSnapshot(docs => {
          let purchases = []
          docs.forEach(doc => {
            purchases.push({...doc.data(), id:doc.id})
          })
          dispatch({type: 'SET_PURCHASES', purchases})
        }, err => {
          unsubscribePurchases()
        })  
        const unsubscribeStockTrans = firebase.firestore().collection('stockTrans').onSnapshot(docs => {
          let stockTrans = []
          docs.forEach(doc => {
            stockTrans.push({...doc.data(), id:doc.id})
          })
          dispatch({type: 'SET_STOCK_TRANS', stockTrans})
        }, err => {
          unsubscribeStockTrans()
        })  
        const unsubscribePackTrans = firebase.firestore().collection('packTrans').onSnapshot(docs => {
          let packTrans = []
          docs.forEach(doc => {
            packTrans.push({...doc.data(), id:doc.id})
          })
          dispatch({type: 'SET_PACK_TRANS', packTrans})
        }, err => {
          unsubscribePackTrans()
        })  
        const unsubscribePriceAlarms = firebase.firestore().collection('priceAlarms').onSnapshot(docs => {
          let priceAlarms = []
          docs.forEach(doc => {
            priceAlarms.push({...doc.data(), id:doc.id})
          })
          dispatch({type: 'SET_PRICE_ALARMS', priceAlarms})
        }, err => {
          unsubscribePriceAlarms()
        })  
        const unsubscribeForgetPassword = firebase.firestore().collection('forgetPassword').onSnapshot(docs => {
          let forgetPassword = []
          docs.forEach(doc => {
            forgetPassword.push({...doc.data(), id:doc.id})
          })
          dispatch({type: 'SET_FORGET_PASSWORD', forgetPassword})
        }, err => {
          unsubscribeForgetPassword()
        })  
      }
    })
    firebase.firestore().collection('sections').onSnapshot(docs => {
      let sections = []
      docs.forEach(doc => {
        sections.push({...doc.data(), id:doc.id})
      })
      dispatch({type: 'SET_SECTIONS', sections})
    })  
    firebase.firestore().collection('categories').onSnapshot(docs => {
      let categories = []
      docs.forEach(doc => {
        categories.push({...doc.data(), id:doc.id})
      })
      dispatch({type: 'SET_CATEGORIES', categories})
    })
    firebase.firestore().collection('trademarks').onSnapshot(docs => {
      let trademarks = []
      docs.forEach(doc => {
        trademarks.push({...doc.data(), id:doc.id})
      })
      dispatch({type: 'SET_TRADEMARKS', trademarks})
    })  
    firebase.firestore().collection('countries').onSnapshot(docs => {
      let countries = []
      docs.forEach(doc => {
        countries.push({...doc.data(), id:doc.id})
      })
      dispatch({type: 'SET_COUNTRIES', countries})
    })  
    firebase.firestore().collection('products').onSnapshot(docs => {
      let products = []
      docs.forEach(doc => {
        products.push({...doc.data(), id: doc.id})
      })
      dispatch({type: 'SET_PRODUCTS', products})
    })
    firebase.firestore().collection('packs').onSnapshot(docs => {
      let packs = []
      docs.forEach(doc => {
        let minPrice = Math.min(...doc.data().stores.map(store => !store.offerEnd || new Date() <= store.offerEnd.toDate() ? store.price : store.oldPrice))
        minPrice = minPrice === Infinity ? 0 : minPrice
        const value = doc.data().units ? minPrice / doc.data().units : 0
        let isOffer = doc.data().isOffer
        if (isOffer === false) {
          const store = doc.data().stores.find(rec => rec.offerEnd && new Date() <= rec.offerEnd.toDate())
          if (store) {
            if (store.price === minPrice) {
              isOffer = true
            }
          }
        }
        packs.push({...doc.data(), id: doc.id, isOffer, value, price: minPrice})
      })
      dispatch({type: 'SET_PACKS', packs})
    })
  }, []);
  return (
    <StoreContext.Provider value={{state, user, dispatch}}>
      {props.children}
    </StoreContext.Provider>
  );
}
 
export default Store;

