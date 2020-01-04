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
    countries: [], 
    stores: [], 
    basket, 
    trademarks: [], 
    users: [],
    purchases: [],
    orders: [],
    alarms: [],
    stockTrans: [],
    products: [],
    packs: [],
    passwordRequests: [],
    invitations: [],
    customers: [],
    spendings: [],
    monthlyTrans: [],
    locations: [],
    ratings: [],
    storePacks: [],
    logs: [],
    cancelRequests: [],
    tags: []
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
    const unsubscribePasswordRequests = firebase.firestore().collection('password-requests').onSnapshot(docs => {
      let passwordRequests = []
      docs.forEach(doc => {
        passwordRequests.push({...doc.data(), id:doc.id})
      })
      dispatch({type: 'SET_PASSWORD-REQUESTS', passwordRequests})
    }, err => {
      unsubscribePasswordRequests()
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
        const unsubscribePurchases = firebase.firestore().collection('purchases').onSnapshot(docs => {
          let purchases = []
          docs.forEach(doc => {
            purchases.push({...doc.data(), id:doc.id})
          })
          dispatch({type: 'SET_PURCHASES', purchases})
        }, err => {
          unsubscribePurchases()
        })  
        const unsubscribeStockTrans = firebase.firestore().collection('stock-trans').onSnapshot(docs => {
          let stockTrans = []
          docs.forEach(doc => {
            stockTrans.push({...doc.data(), id:doc.id})
          })
          dispatch({type: 'SET_STOCK_TRANS', stockTrans})
        }, err => {
          unsubscribeStockTrans()
        })  
        const unsubscribeAlarms = firebase.firestore().collection('alarms').onSnapshot(docs => {
          let alarms = []
          docs.forEach(doc => {
            alarms.push({...doc.data(), id:doc.id})
          })
          dispatch({type: 'SET_ALARMS', alarms})
        }, err => {
          unsubscribeAlarms()
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
        const unsubscribeMonthlyTrans = firebase.firestore().collection('monthly-trans').onSnapshot(docs => {
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
        const unsubscribeCancelRequests = firebase.firestore().collection('cancel-requests').onSnapshot(docs => {
          let cancelRequests = []
          docs.forEach(doc => {
            cancelRequests.push({...doc.data(), id:doc.id})
          })
          dispatch({type: 'SET_CANCEL_REQUESTS', cancelRequests})
        }, err => {
          unsubscribeCancelRequests()
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
  }, [])
  return (
    <StoreContext.Provider value={{state, user, dispatch}}>
      {props.children}
    </StoreContext.Provider>
  )
}
 
export default Store

