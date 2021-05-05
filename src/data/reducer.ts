import {Action, State} from "./types"

const Reducer = (state: State, action: Action) => {
    switch (action.type){
      case 'SET_LOCATIONS':
        return {...state, locations: action.payload}
      case 'SET_COUNTRIES':
        return {...state, countries: action.payload}
      case 'SET_TRADEMARKS':
        return {...state, trademarks: action.payload}
      case 'SET_NOTIFICATIONS':
        return {...state, notifications: action.payload}
      case 'SET_STORES':
        return {...state, stores: action.payload}
      case 'SET_CATEGORIES':
        return {...state, categories: action.payload}
      case 'SET_USERS':
        return {...state, users: action.payload}
      case 'SET_PASSWORD_REQUESTS':
        return {...state, passwordRequests: action.payload}
      case 'SET_PRODUCT_REQUESTS':
        return {...state, productRequests: action.payload}
      case 'SET_PRODUCTS':
        return {...state, products: action.payload}
      case 'SET_PACKS':
        return {...state, packs: action.payload}
      case 'SET_PACK_STORES':
        return {...state, packStores: action.payload}
      case 'SET_LOGS':
        return {...state, logs: action.payload}
      case 'SET_ADVERTS':
        return {...state, adverts: action.payload}
      case 'SET_ARCHIVED_PRODUCTS':
        return {...state, archivedProducts: action.payload}
      case 'SET_ARCHIVED_PACKS':
        return {...state, archivedPacks: action.payload}
      case 'SET_UNITS':
        return {...state, units: action.payload}
      case 'LOGIN':
        return {...state, user: action.payload}
      case 'LOGOUT':
        return {...state, user: undefined}
      default:
        return state
    }
  }
  
  export default Reducer