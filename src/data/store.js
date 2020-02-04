import React, { createContext, useReducer, useEffect, useState } from 'react'
import Reducer from './reducer'
import firebase from './firebase'

export const StoreContext = createContext()

const Store = props => {
  const localData = localStorage.getItem('basket')
  const basket = localData ? JSON.parse(localData) : ''
  const [user, setUser] = useState(null)
  const initState = {
    categories: [], 
    lookups: [], 
    stores: [], 
    basket, 
    users: [],
    purchases: [],
    orders: [],
    stockTrans: [],
    products: [],
    packs: [],
    passwordRequests: [],
    customers: [],
    spendings: [],
    monthlyTrans: [],
    storePacks: [],
    logs: [],
    archivedOrders: [],
    adverts: [],
    archivedPurchases: [],
    archivedStockTrans: [],
    archivedProducts: [],
    archivedPacks: []
  }
  const [state, dispatch] = useReducer(Reducer, initState)
  useEffect(() => {
    const unsubscribeCategories = firebase.firestore().collection('categories').onSnapshot(docs => {
      let categories = []
      docs.forEach(doc => {
        categories.push({...doc.data(), id:doc.id})
      })
      dispatch({type: 'SET_CATEGORIES', categories})
    }, err => {
      unsubscribeCategories()
    })
    const unsubscribePacks = firebase.firestore().collection('packs').where('isArchived', '==', false).onSnapshot(docs => {
      let packs = []
      docs.forEach(doc => {
        packs.push({...doc.data(), id: doc.id})
      })
      dispatch({type: 'SET_PACKS', packs})
    }, err => {
      unsubscribePacks()
    })
    const unsubscribePasswordRequests = firebase.firestore().collection('password-requests').onSnapshot(docs => {
      let passwordRequests = []
      docs.forEach(doc => {
        passwordRequests.push({...doc.data(), id:doc.id})
      })
      dispatch({type: 'SET_PASSWORD_REQUESTS', passwordRequests})
    }, err => {
      unsubscribePasswordRequests()
    })
    const unsubscribeAdverts = firebase.firestore().collection('adverts').onSnapshot(docs => {
      let adverts = []
      docs.forEach(doc => {
        adverts.push({...doc.data(), id:doc.id})
      })
      dispatch({type: 'SET_ADVERTS', adverts})
    }, err => {
      unsubscribeAdverts()
    }) 
    firebase.auth().onAuthStateChanged(user => {
      setUser(user)
      if (user){
        const unsubscribeLookups = firebase.firestore().collection('lookups').onSnapshot(docs => {
          let lookups = []
          docs.forEach(doc => {
            lookups.push({...doc.data(), id:doc.id})
          })
          dispatch({type: 'SET_LOOKUPS', lookups})
        }, err => {
          unsubscribeLookups()
        })  
        const unsubscribeProducts = firebase.firestore().collection('products').where('isArchived', '==', false).onSnapshot(docs => {
          let products = []
          docs.forEach(doc => {
            products.push({...doc.data(), id: doc.id})
          })
          dispatch({type: 'SET_PRODUCTS', products})
        }, err => {
          unsubscribeProducts()
        })    
        const unsubscribeOrders = firebase.firestore().collection('orders').where('isArchived', '==', false).onSnapshot(docs => {
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
        const unsubscribePurchases = firebase.firestore().collection('purchases').where('isArchived', '==', false).onSnapshot(docs => {
          let purchases = []
          docs.forEach(doc => {
            purchases.push({...doc.data(), id:doc.id})
          })
          dispatch({type: 'SET_PURCHASES', purchases})
        }, err => {
          unsubscribePurchases()
        })  
        const unsubscribeStockTrans = firebase.firestore().collection('stock-trans').where('isArchived', '==', false).onSnapshot(docs => {
          let stockTrans = []
          docs.forEach(doc => {
            stockTrans.push({...doc.data(), id:doc.id})
          })
          dispatch({type: 'SET_STOCK_TRANS', stockTrans})
        }, err => {
          unsubscribeStockTrans()
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
        const unsubscribeMonthlyTrans = firebase.firestore().collection('monthly-trans').onSnapshot(docs => {
          let monthlyTrans = []
          docs.forEach(doc => {
            monthlyTrans.push({...doc.data(), id:doc.id})
          })
          dispatch({type: 'SET_MONTHLY_TRANS', monthlyTrans})
        }, err => {
          unsubscribeMonthlyTrans()
        })  
        const unsubscribeStorePacks = firebase.firestore().collection('store-packs').onSnapshot(docs => {
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
      }
    })
  }, [])
  return (
    <StoreContext.Provider value={{state, user, dispatch}}>
      {props.children}
    </StoreContext.Provider>
  )
}
 
export default Store

