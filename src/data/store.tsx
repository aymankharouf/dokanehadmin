import { createContext, useReducer, useEffect } from 'react'
import Reducer from './reducer'
import firebase from './firebase'
import { State, Context, Category, PasswordRequest, Advert } from './interfaces'

export const StoreContext = createContext({} as Context)

const Store = (props: any) => {
  const localData = localStorage.getItem('basket')
  const basket = localData ? JSON.parse(localData) : ''
  const initState: State = {
    categories: [], 
    locations: [], 
    countries: [],
    trademarks: [],
    stores: [], 
    basket, 
    users: [],
    products: [],
    packs: [],
    passwordRequests: [],
    customers: [],
    packPrices: [],
    logs: [],
    adverts: [],
    archivedProducts: [],
    archivedPacks: [],
    notifications: [],
    alarms: [],
    ratings: [],
    invitations: [],
    packTypes: []
  }
  const [state, dispatch] = useReducer(Reducer, initState)
  useEffect(() => {
    const unsubscribeCategories = firebase.firestore().collection('categories').onSnapshot(docs => {
      let categories: Category[] = []
      docs.forEach(doc => {
        categories.push({
          id: doc.id,
          name: doc.data().name,
          parentId: doc.data().parentId,
          ordering: doc.data().ordering,
          isLeaf: doc.data().isLeaf,
          isActive: doc.data().isActive
        })
      })
      dispatch({type: 'SET_CATEGORIES', payload: categories})
    }, err => {
      unsubscribeCategories()
    })
    const unsubscribePacks = firebase.firestore().collection('packs').where('isArchived', '==', false).onSnapshot(docs => {
      let packs: any = []
      let packPrices: any = []
      docs.forEach(doc => {
        packs.push({...doc.data(), id: doc.id})
        if (doc.data().prices) {
          doc.data().prices.forEach((p: any) => {
            packPrices.push({...p, packId: doc.id})
          })
        }
      })
      dispatch({type: 'SET_PACKS', payload: packs})
      dispatch({type: 'SET_PACK_PRICES', payload: packPrices})
    }, err => {
      unsubscribePacks()
    })
    const unsubscribePasswordRequests = firebase.firestore().collection('password-requests').onSnapshot(docs => {
      let passwordRequests: PasswordRequest[] = []
      docs.forEach(doc => {
        passwordRequests.push({
          id: doc.id,
          mobile: doc.data().mobile,
          status: doc.data().status,
          time: doc.data().time
        })
      })
      dispatch({type: 'SET_PASSWORD_REQUESTS', payload: passwordRequests})
    }, err => {
      unsubscribePasswordRequests()
    })
    const unsubscribeAdverts = firebase.firestore().collection('adverts').onSnapshot(docs => {
      let adverts: Advert[] = []
      docs.forEach(doc => {
        adverts.push({
          id: doc.id,
          type: doc.data().type,
          text: doc.data().text,
          title: doc.data().title,
          isActive: doc.data().isActive,
          imageUrl: doc.data().imageUrl,
          time: doc.data().time.toDate()
        })
      })
      dispatch({type: 'SET_ADVERTS', payload: adverts})
    }, err => {
      unsubscribeAdverts()
    }) 
    firebase.auth().onAuthStateChanged(user => {
      if (user){
        dispatch({type: 'LOGIN', payload: user})
        const unsubscribeLocations = firebase.firestore().collection('lookups').doc('l').onSnapshot(doc => {
          if (doc.data()) dispatch({type: 'SET_LOCATIONS', payload: doc.data()?.values})
        }, err => {
          unsubscribeLocations()
        })  
        const unsubscribeCountries = firebase.firestore().collection('lookups').doc('c').onSnapshot(doc => {
          if (doc.data()) dispatch({type: 'SET_COUNTRIES', payload: doc.data()?.values})
        }, err => {
          unsubscribeCountries()
        })
        const unsubscribeTrademarks = firebase.firestore().collection('lookups').doc('t').onSnapshot(doc => {
          if (doc.data()) dispatch({type: 'SET_TRADEMARKS', payload: doc.data()?.values})
        }, err => {
          unsubscribeTrademarks()
        })
        const unsubscribePackTypes = firebase.firestore().collection('lookups').doc('p').onSnapshot(doc => {
          if (doc.data()) dispatch({type: 'SET_PACK_TYPES', payload: doc.data()?.values})
        }, err => {
          unsubscribePackTypes()
        })
        const unsubscribeProducts = firebase.firestore().collection('products').where('isArchived', '==', false).onSnapshot(docs => {
          let products: any = []
          docs.forEach(doc => {
            products.push({...doc.data(), id: doc.id})
          })
          dispatch({type: 'SET_PRODUCTS', payload: products})
        }, err => {
          unsubscribeProducts()
        })    
        const unsubscribeUsers = firebase.firestore().collection('users').onSnapshot(docs => {
          let users: any = []
          let notifications: any = []
          let alarms: any = []
          let ratings: any = []
          let invitations: any = []
          docs.forEach(doc => {
            users.push({...doc.data(), id:doc.id})
            if (doc.data().notifications) {
              doc.data().notifications.forEach((n: any) => {
                notifications.push({...n, userId: doc.id})
              })
            }
            if (doc.data().alarms) {
              doc.data().alarms.forEach((a: any) => {
                alarms.push({...a, userId: doc.id})
              })
            }
            if (doc.data().ratings) {
              doc.data().ratings.forEach((r: any) => {
                ratings.push({...r, userId: doc.id})
              })
            }
            if (doc.data().friends) {
              doc.data().friends.forEach((f: any) => {
                invitations.push({...f, userId: doc.id})
              })
            }
          })
          dispatch({type: 'SET_USERS', payload: users})
          dispatch({type: 'SET_NOTIFICATIONS', payload: notifications})
          dispatch({type: 'SET_ALARMS', payload: alarms})
          dispatch({type: 'SET_RATINGS', payload: ratings})
          dispatch({type: 'SET_INVITATIONS', payload: invitations})
        }, err => {
          unsubscribeUsers()
        })  
        const unsubscribeCustomers = firebase.firestore().collection('customers').onSnapshot(docs => {
          let customers: any = []
          docs.forEach(doc => {
            customers.push({...doc.data(), id:doc.id})
          })
          dispatch({type: 'SET_CUSTOMERS', payload: customers})
        }, err => {
          unsubscribeCustomers()
        })  
        const unsubscribeStores = firebase.firestore().collection('stores').onSnapshot(docs => {
          let stores: any = []
          docs.forEach(doc => {
            stores.push({...doc.data(), id:doc.id})
          })
          dispatch({type: 'SET_STORES', payload: stores})
        }, err => {
          unsubscribeStores()
        })  
        const unsubscribeLogs = firebase.firestore().collection('logs').onSnapshot(docs => {
          let logs: any = []
          docs.forEach(doc => {
            logs.push({...doc.data(), id:doc.id})
          })
          dispatch({type: 'SET_LOGS', payload: logs})
        }, err => {
          unsubscribeLogs()
        })  
      }
    })
  }, [])
  return (
    <StoreContext.Provider value={{state, dispatch}}>
      {props.children}
    </StoreContext.Provider>
  )
}
 
export default Store

