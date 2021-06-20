import {createContext, useReducer, useEffect} from 'react'
import Reducer from './reducer'
import firebase from './firebase'
import {State, Context, Category, PasswordRequest, Advert, Product, Log, PackStore, Pack, User, Store, ProductRequest, StoreRequest, PackRequest} from './types'

export const StateContext = createContext({} as Context)

type Props = {
  children: React.ReactElement
}
const StateProvider = ({children}: Props) => {
  const initState: State = {
    categories: [], 
    regions: [], 
    countries: [],
    trademarks: [],
    stores: [], 
    users: [],
    products: [],
    packs: [],
    passwordRequests: [],
    packStores: [],
    logs: [],
    adverts: [],
    productRequests: [],
    storeRequests: [],
    packRequests: [],
    searchText: '',
  }
  const [state, dispatch] = useReducer(Reducer, initState)
  useEffect(() => {
    const unsubscribeCategories = firebase.firestore().collection('categories').onSnapshot(docs => {
      let categories: Category[] = []
      docs.forEach(doc => {
        categories.push({
          id: doc.id,
          name: doc.data().name,
          mainId: doc.data().mainId,
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
    const unsubscribePacks = firebase.firestore().collection('packs').where('product.isActive', '==', true).onSnapshot(docs => {
      let packs: Pack[] = []
      let packStores: PackStore[] = []
      docs.forEach(doc => {
        let minPrice = 0
        if (doc.data().stores) {
          const activePrices = doc.data().stores.filter((s: PackStore) => s.isRetail && s.isActive)
          const prices = activePrices.map((p: PackStore) => p.price)
          minPrice = prices.length > 0 ? Math.min(...prices) : 0
        }
        packs.push({
          id: doc.id,
          name: doc.data().name,
          product: doc.data().product,
          imageUrl: doc.data().imageUrl,
          byWeight: doc.data().byWeight,
          unitsCount: doc.data().unitsCount,
          subPackId: doc.data().subPackId,
          subCount: doc.data().subCount,
          withGift: doc.data().withGift,
          gift: doc.data().gift,
          forSale: doc.data().forSale,
          isActive: doc.data().isActive,
          lastTrans: doc.data().lastTrans.toDate(),
          price: minPrice,
          weightedPrice: minPrice / doc.data().unitsCount,
        })
        if (doc.data().stores) {
          doc.data().stores.forEach((s: any) => {
            packStores.push({
              packId: doc.id,
              storeId: s.storeId,
              price: s.price,
              isRetail: s.isRetail,
              isActive: s.isActive,
              claimUserId: s.claimUserId || null,
              time: s.time.toDate(),
            })
          })
        }
      })
      dispatch({type: 'SET_PACKS', payload: packs})
      dispatch({type: 'SET_PACK_STORES', payload: packStores})
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
          text: doc.data().text,
          title: doc.data().title,
          startDate: doc.data().startDate,
          endDate: doc.data().endDate,
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
        const unsubscribeRegions = firebase.firestore().collection('lookups').doc('r').onSnapshot(doc => {
          if (doc.data()) dispatch({type: 'SET_REGIONS', payload: doc.data()?.values})
        }, err => {
          unsubscribeRegions()
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
        const unsubscribeProducts = firebase.firestore().collection('products').where('isActive', '==', true).onSnapshot(docs => {
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
              unit: doc.data().unit,
              imageUrl: doc.data().imageUrl,
              rating: doc.data().rating,
              ratingCount: doc.data().ratingCount,
              isActive: doc.data().isActive
            })
          })
          dispatch({type: 'SET_PRODUCTS', payload: products})
        }, err => {
          unsubscribeProducts()
        })    
        const unsubscribeUsers = firebase.firestore().collection('users').onSnapshot(docs => {
          let users: User[] = []
          docs.forEach(doc => {
            users.push({
              id: doc.id,
              position: doc.data().position,
              mobile: doc.data().mobile,
              name: doc.data().name,
              storeId: doc.data().storeId,
              storeName: doc.data().storeName,
              colors: doc.data().colors,
              address: doc.data().address,
              regionId: doc.data().regionId,
              time: doc.data().time.toDate(),
              type: doc.data().type,
              isActive: doc.data().isActive
            })
          })
          dispatch({type: 'SET_USERS', payload: users})
        }, err => {
          unsubscribeUsers()
        })  
        const unsubscribeStores = firebase.firestore().collection('stores').onSnapshot(docs => {
          let stores: Store[] = []
          const productRequests: ProductRequest[] = []
          const storeRequests: StoreRequest[] = []
          const packRequests: PackRequest[] = []
          docs.forEach(doc => {
            stores.push({
              id: doc.id,
              name: doc.data().name,
              mobile: doc.data().mobile,
              ownerId: doc.data().ownerId,
              address: doc.data().address,
              isActive: doc.data().isActive,
              regionId: doc.data().regionId,
              position: doc.data().position,
              type: doc.data().type,
              claimsCount: doc.data().claimsCount
            })
            doc.data().productRequests?.forEach((r: any) => {
              productRequests.push({
                id: r.id,
                storeId: doc.id,
                name: r.name,
                country: r.country,
                weight: r.weight,
                price: r.price,
                imageUrl: r.imageUrl,
                time: r.time?.toDate()
              })
            })
            doc.data().requests?.forEach((r: any) => {
              storeRequests.push({
                storeId: doc.id,
                packId: r
              })
            })
            doc.data().packRequests?.forEach((r: any) => {
              packRequests.push({
                id: r.id,
                storeId: doc.id,
                siblingPackId: r.siblingPackId,
                name: r.name,
                price: r.price,
                withGift: r.withGift,
                gift: r.gift,
                subCount: r.subCount,
                imageUrl: r.imageUrl,
                time: r.time.toDate()
              })
            })
          })
          dispatch({type: 'SET_STORES', payload: stores})
          dispatch({type: 'SET_PRODUCT_REQUESTS', payload: productRequests})
          dispatch({type: 'SET_STORE_REQUESTS', payload: storeRequests})
          dispatch({type: 'SET_PACK_REQUESTS', payload: packRequests})
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
      } else {
        dispatch({type: 'LOGOUT'})
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

