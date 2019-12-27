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
    {id: 'f', name: 'مكتمل'},
    {id: 'p', name: 'جاهز'},
    {id: 'd', name: 'مستلم'},
    {id: 'c', name: 'ملغي'},
    {id: 'u', name: 'غير متوفر'},
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
    {id: 'i', name: 'استيداع'},
    {id: 'd', name: 'اتلاف'},
    {id: 'g', name: 'تبرع'},
    {id: 'r', name: 'ارجاع'},
    {id: 'c', name: 'تصريف'},
    {id: 'w', name: 'سحب'}
  ]
  const spendingTypes = [
    {id: 'w', name: 'سحب'},
    {id: 'f', name: 'بنزين'},
    {id: 'm', name: 'صيانة'},
  ]
  const ratingValues = [
    {id: 0, name: 'ﻻ أنصح به'},
    {id: 1, name: 'أنصح به'}
  ]
  const otherMobileHolders = [
    {id: '1', name: 'نفسه'},
    {id: '2', name: 'زوج/زوجة'},
    {id: '3', name: 'احد اﻻبناء'},
    {id: '4', name: 'احد الوالدين'},
    {id: '5', name: 'صديق'},
    {id: '6', name: 'جار'}
  ]
  const orderPositions = [
    {id: 's', name: 'المستودع'},
    {id: 'c', name: 'مركز التوزيع'},
    {id: 'd', name: 'سيارة التوزيع'},
  ]
  const orderPackStatus = [
    {id: 'n', name: 'جديد'},
    {id: 'p', name: 'شراء جزئي'},
    {id: 'f', name: 'تم الشراء'},
    {id: 'u', name: 'غير متوفر'},
    {id: 'pu', name: 'شراء جزئي والباقي غير متوفر'},
    {id: 'r', name: 'مرتجع'},
    {id: 'pr', name: 'مرتجع جزئي'}
  ]
  const storageTypes = [
    {id: 'd', name: 'جاف'},
    {id: 'c', name: 'مبرد'},
    {id: 'f', name: 'مجمد'}
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
    customers: [],
    spendingTypes,
    spendings: [],
    monthlyTrans: [],
    locations: [],
    ratings: [],
    ratingValues,
    storePacks: [],
    otherMobileHolders,
    logs: [],
    cancelOrders: [],
    orderPositions,
    orderPackStatus,
    tags: [],
    storageTypes
  }
  const [state, dispatch] = useReducer(Reducer, initState)
  useEffect(() => {
    const unsubscribeSections = firebase.firestore().collection('sections').onSnapshot(docs => {
      let sections = []
      docs.forEach(doc => {
        sections.push({...doc.data(), id:doc.id})
      })
      dispatch({type: 'SET_SECTIONS', sections})
    }, err => {
      unsubscribeSections()
    })  
    const unsubscribeCategories = firebase.firestore().collection('categories').onSnapshot(docs => {
      let categories = []
      docs.forEach(doc => {
        categories.push({...doc.data(), id:doc.id})
      })
      dispatch({type: 'SET_CATEGORIES', categories})
    }, err => {
      unsubscribeCategories()
    })
    const unsubscribeTrademarks = firebase.firestore().collection('trademarks').onSnapshot(docs => {
      let trademarks = []
      docs.forEach(doc => {
        trademarks.push({...doc.data(), id:doc.id})
      })
      dispatch({type: 'SET_TRADEMARKS', trademarks})
    }, err => {
      unsubscribeTrademarks()
    })  
    const unsubscribeCountries = firebase.firestore().collection('countries').onSnapshot(docs => {
      let countries = []
      docs.forEach(doc => {
        countries.push({...doc.data(), id:doc.id})
      })
      dispatch({type: 'SET_COUNTRIES', countries})
    }, err => {
      unsubscribeCountries()
    })  
    const unsubscribeProducts = firebase.firestore().collection('products').onSnapshot(docs => {
      let products = []
      docs.forEach(doc => {
        products.push({...doc.data(), id: doc.id})
      })
      dispatch({type: 'SET_PRODUCTS', products})
    }, err => {
      unsubscribeProducts()
    })
    const unsubscribePacks = firebase.firestore().collection('packs').onSnapshot(docs => {
      let packs = []
      docs.forEach(doc => {
        packs.push({...doc.data(), id: doc.id})
      })
      dispatch({type: 'SET_PACKS', packs})
    }, err => {
      unsubscribePacks()
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
    const unsubscribeLocations = firebase.firestore().collection('locations').onSnapshot(docs => {
      let locations = []
      docs.forEach(doc => {
        locations.push({...doc.data(), id:doc.id})
      })
      dispatch({type: 'SET_LOCATIONS', locations})
    }, err => {
      unsubscribeLocations()
    })  

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
        const unsubscribeMonthlyTrans = firebase.firestore().collection('monthlyTrans').onSnapshot(docs => {
          let monthlyTrans = []
          docs.forEach(doc => {
            monthlyTrans.push({...doc.data(), id:doc.id})
          })
          dispatch({type: 'SET_MONTHLY_TRANS', monthlyTrans})
        }, err => {
          unsubscribeMonthlyTrans()
        })  
        const unsubscribeRatings = firebase.firestore().collection('ratings').onSnapshot(docs => {
          let ratings = []
          docs.forEach(doc => {
            ratings.push({...doc.data(), id:doc.id})
          })
          dispatch({type: 'SET_RATINGS', ratings})
        }, err => {
          unsubscribeRatings()
        })  
        const unsubscribeStorePacks = firebase.firestore().collection('storePacks').onSnapshot(docs => {
          let storePacks = []
          docs.forEach(doc => {
            storePacks.push({...doc.data(), id:doc.id})
          })
          dispatch({type: 'SET_STORE_PACKS', storePacks})
        }, err => {
          unsubscribeStorePacks()
        })  
        const unsubscribeLogs = firebase.firestore().collection('logs').onSnapshot(docs => {
          let logs = []
          docs.forEach(doc => {
            logs.push({...doc.data(), id:doc.id})
          })
          dispatch({type: 'SET_LOGS', logs})
        }, err => {
          unsubscribeLogs()
        })  
        const unsubscribeCancelOrders = firebase.firestore().collection('cancelOrders').onSnapshot(docs => {
          let cancelOrders = []
          docs.forEach(doc => {
            cancelOrders.push({...doc.data(), id:doc.id})
          })
          dispatch({type: 'SET_CANCEL_ORDERS', cancelOrders})
        }, err => {
          unsubscribeCancelOrders()
        })  
        const unsubscribeTags = firebase.firestore().collection('tags').onSnapshot(docs => {
          let tags = []
          docs.forEach(doc => {
            tags.push({...doc.data(), id:doc.id})
          })
          dispatch({type: 'SET_TAGS', tags})
        }, err => {
          unsubscribeTags()
        })  
      }
    })
  }, []);
  return (
    <StoreContext.Provider value={{state, user, dispatch}}>
      {props.children}
    </StoreContext.Provider>
  );
}
 
export default Store;

