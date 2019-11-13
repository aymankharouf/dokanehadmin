import React, { createContext, useReducer, useEffect, useState } from 'react';
import Reducer from './Reducer'
import firebase from './firebase'
import labels from './labels'

export const StoreContext = createContext()

const Store = props => {
  
  const randomColors = [
    {id: 0, name: 'red'},
    {id: 1, name: 'green'},
    {id: 2, name: 'blue'},
    {id: 3, name: 'pink'},
    {id: 4, name: 'yellow'},
    {id: 5, name: 'orange'},
    {id: 6, name: 'purple'},
    {id: 7, name: 'deeppurple'},
    {id: 8, name: 'lightblue'},
    {id: 9, name: 'teal'},
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
    {id: '1', name: 'المستودع'},
    {id: '2', name: 'دكانة'},
    {id: '3', name: 'محل'},
    {id: '4', name: 'سوبرماركت'},
    {id: '5', name: 'محل جملة'}
  ]
  const stockTransTypes = [
    {id: 'p', name: 'شراء'},
    {id: 's', name: 'بيع'},
    {id: 'r', name: 'ارجاع'}
  ]
  const customerTypes = [
    {id: 'n', name: 'عميل عادي'},
    {id: 'o', name: 'صاحب محل'},
    {id: 'b', name: 'قائمة سوداء'},
    {id: 'v', name: 'عميل مميز'},
    {id: 's', name: 'عميل خاص'}
  ]
  const discountTypes = [
    {id: 'f', name: 'خصم اول طلب', value: 500},
    {id: 's', name: 'خصم خاص', value: 500},
    {id: 'i', name: 'خصم دعوة صديق', value: 500},
    {id: 'p', name: 'خصم ابلاغ عن سعر اقل', value: 500}
  ]
  const spendingTypes = [
    {id: 'w', name: 'سحب'},
    {id: 'f', name: 'بنزين'},
    {id: 'm', name: 'صيانة'},
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
    stockTrans: [],
    products: [],
    packs: [],
    forgetPassword: [],
    invitations: [],
    unitTypes,
    customerTypes,
    customers: [],
    discountTypes,
    spendingTypes,
    spendings: []
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
        const unsubscribeInvitations = firebase.firestore().collection('invitations').onSnapshot(docs => {
          let invitations = []
          docs.forEach(doc => {
            invitations.push({...doc.data(), id:doc.id})
          })
          dispatch({type: 'SET_INVITATIONS', invitations})
        }, err => {
          unsubscribeInvitations()
        })
        const unsubscribeSpendings = firebase.firestore().collection('spendings').onSnapshot(docs => {
          let spendings = []
          docs.forEach(doc => {
            spendings.push({...doc.data(), id:doc.id})
          })
          dispatch({type: 'SET_SPENDINGS', spendings})
        }, err => {
          unsubscribeSpendings()
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
    const today = (new Date()).setHours(0, 0, 0, 0)
    firebase.firestore().collection('packs').onSnapshot(docs => {
      let packs = []
      docs.forEach(doc => {
        let storesPrices = doc.data().stores.map(store => !store.offerEnd || today <= store.offerEnd.toDate() ? store.price : null)
        storesPrices = storesPrices.filter(rec => rec !== null)
        let minPrice = Math.min(...storesPrices)
        minPrice = minPrice === Infinity ? 0 : minPrice
        const value = doc.data().unitsCount ? minPrice / doc.data().unitsCount : 0
        let isOffer = doc.data().isOffer
        if (isOffer === false) {
          const store = doc.data().stores.find(rec => rec.price === minPrice && rec.offerEnd && today <= rec.offerEnd.toDate())
          if (store) {
            isOffer = true
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

