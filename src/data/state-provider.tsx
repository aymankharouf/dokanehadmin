import { createContext, useReducer, useEffect } from 'react'
import Reducer from './reducer'
import firebase from './firebase'
import { State, Context, Category, PasswordRequest, Advert, Product, Log, PackPrice, Pack, User, Alarm, Rating, Notification, Store } from './types'

export const StateContext = createContext({} as Context)

type Props = {
  children: React.ReactElement
}
const StateProvider = ({ children }: Props) => {
  const initState: State = {
    categories: [], 
    locations: [], 
    countries: [],
    trademarks: [],
    stores: [], 
    users: [],
    products: [],
    packs: [],
    passwordRequests: [],
    packPrices: [],
    logs: [],
    adverts: [],
    archivedProducts: [],
    archivedPacks: [],
    notifications: [],
    alarms: [],
    ratings: [],
    packTypes: [],
    units: []
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
      let packs: Pack[] = []
      let packPrices: PackPrice[] = []
      docs.forEach(doc => {
        let prices, minPrice
        if (doc.data().prices) {
          prices = doc.data().prices.map((p: PackPrice) => p.price)
          minPrice = prices.length > 0 ? Math.min(...prices) : undefined
        }
        packs.push({
          id: doc.id,
          name: doc.data().name,
          product: doc.data().product,
          imageUrl: doc.data().imageUrl,
          isOffer: doc.data().isOffer,
          offerEnd: doc.data().offerEnd,
          byWeight: doc.data().byWeight,
          weightedPrice: doc.data().weightedPrice,
          typeUnits: doc.data().typeUnits,
          standardUnits: doc.data().standardUnits,
          packTypeId: doc.data().packTypeId,
          unitId: doc.data().unitId,
          specialImage: doc.data().specialImage,
          price: minPrice
        })
        if (doc.data().prices) {
          doc.data().prices.forEach((p: PackPrice) => {
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
          time: doc.data().time.toDate()
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
        const unsubscribeUnits = firebase.firestore().collection('lookups').doc('u').onSnapshot(doc => {
          if (doc.data()) dispatch({type: 'SET_UNITS', payload: doc.data()?.values})
        }, err => {
          unsubscribeUnits()
        })
        const unsubscribeProducts = firebase.firestore().collection('products').where('isArchived', '==', false).onSnapshot(docs => {
          let products: Product[] = []
          docs.forEach(doc => {
            products.push({
              id: doc.id,
              name: doc.data().name,
              alias: doc.data().alias,
              description: doc.data().description,
              categoryId: doc.data().categoryId,
              trademarkId: doc.data().trademarkId,
              countryId: doc.data().countryId,
              unitType: doc.data().unitType,
              imageUrl: doc.data().imageUrl,
              rating: doc.data().rating,
              ratingCount: doc.data().ratingCount,
              isArchived: doc.data().isArchived
            })
          })
          dispatch({type: 'SET_PRODUCTS', payload: products})
        }, err => {
          unsubscribeProducts()
        })    
        const unsubscribeUsers = firebase.firestore().collection('users').onSnapshot(docs => {
          let users: User[] = []
          let notifications: Notification[] = []
          let alarms: Alarm[] = []
          let ratings: Rating[] = []
          docs.forEach(doc => {
            users.push({
              id: doc.id,
              locationId: doc.data().locationId,
              mobile: doc.data().mobile,
              name: doc.data().name,
              time: doc.data().time.toDate()
            })
            if (doc.data().notifications) {
              doc.data().notifications.forEach((n: Notification) => {
                notifications.push({...n, userId: doc.id})
              })
            }
            if (doc.data().alarms) {
              doc.data().alarms.forEach((a: Alarm) => {
                alarms.push({...a, userId: doc.id})
              })
            }
            if (doc.data().ratings) {
              doc.data().ratings.forEach((r: Rating) => {
                ratings.push({...r, userId: doc.id})
              })
            }
          })
          dispatch({type: 'SET_USERS', payload: users})
          dispatch({type: 'SET_NOTIFICATIONS', payload: notifications})
          dispatch({type: 'SET_ALARMS', payload: alarms})
          dispatch({type: 'SET_RATINGS', payload: ratings})
        }, err => {
          unsubscribeUsers()
        })  
        const unsubscribeStores = firebase.firestore().collection('stores').onSnapshot(docs => {
          let stores: Store[] = []
          docs.forEach(doc => {
            stores.push({
              id: doc.id,
              name: doc.data().name,
              mobile: doc.data().mobile,
              address: doc.data().address,
              isActive: doc.data().isActive,
              mapPosition: doc.data().mapPosition,
              locationId: doc.data().locationId
            })
          })
          dispatch({type: 'SET_STORES', payload: stores})
        }, err => {
          unsubscribeStores()
        })  
        const unsubscribeLogs = firebase.firestore().collection('logs').onSnapshot(docs => {
          let logs: Log[] = []
          docs.forEach(doc => {
            logs.push({
              id: doc.id,
              error: doc.data().error,
              page: doc.data().page,
              userId: doc.data().userId,
              time: doc.data().time.toDate()
            })
          })
          dispatch({type: 'SET_LOGS', payload: logs})
        }, err => {
          unsubscribeLogs()
        })  
      }
    })
  }, [])
  return (
    <StateContext.Provider value={{state, dispatch}}>
      {children}
    </StateContext.Provider>
  )
}
 
export default StateProvider

