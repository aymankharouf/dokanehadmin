import { Action, State } from "./interfaces"

const Reducer = (state: State, action: Action) => {
    switch (action.type){
      case 'SET_LOCATIONS':
        return {...state, locations: action.payload}
      case 'SET_COUNTRIES':
        return {...state, countries: action.payload}
      case 'SET_TRADEMARKS':
        return {...state, trademarks: action.payload}
      case 'SET_PACK_TYPES':
        return {...state, packTypes: action.payload}
      case 'SET_NOTIFICATIONS':
        return {...state, notifications: action.payload}
      case 'SET_ALARMS':
        return {...state, alarms: action.payload}
      case 'SET_RATINGS':
        return {...state, ratings: action.payload}
      case 'SET_INVITATIONS':
        return {...state, invitations: action.payload}
      case 'SET_STORES':
        return {...state, stores: action.payload}
      case 'SET_CATEGORIES':
        return {...state, categories: action.payload}
      case 'SET_USERS':
        return {...state, users: action.payload}
      case 'SET_PASSWORD_REQUESTS':
        return {...state, passwordRequests: action.payload}
      case 'SET_PRODUCTS':
        return {...state, products: action.payload}
      case 'SET_PACKS':
        return {...state, packs: action.payload}
      case 'SET_CUSTOMERS':
        return {...state, customers: action.payload}
      case 'SET_PACK_PRICES':
        return {...state, packPrices: action.payload}
      case 'SET_LOGS':
        return {...state, logs: action.payload}
      case 'SET_ADVERTS':
        return {...state, adverts: action.payload}
      case 'SET_ARCHIVED_PRODUCTS':
        return {...state, archivedProducts: action.payload}
      case 'SET_ARCHIVED_PACKS':
        return {...state, archivedPacks: action.payload}
      case 'LOGIN':
        return {...state, user: action.payload}
      default:
        return state
    }
  }
  
  export default Reducer