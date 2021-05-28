import {Action, State, Region, Country, Trademark} from "./types"

const Reducer = (state: State, action: Action) => {
    switch (action.type){
      case 'SET_MAP_POSITION':
        return {...state, mapPosition: action.payload}
      case 'CLEAR_MAP_POSITION':
        return {...state, mapPosition: undefined}
      case 'SET_REGIONS':
        const regions: Region[] = action.payload
        return {...state, regions: regions.sort((r1, r2) => r1.ordering - r2.ordering)}
      case 'SET_COUNTRIES':
        const countries: Country[] = action.payload
        return {...state, countries: countries.sort((c1, c2) => c1.name > c2.name ? 1 : -1)}
      case 'SET_TRADEMARKS':
        const trademarks: Trademark[] = action.payload
        return {...state, trademarks: trademarks.sort((t1, t2) => t1.name > t2.name ? 1 : -1)}
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
      case 'SET_PACK_REQUESTS':
        return {...state, packRequests: action.payload}
      case 'SET_STORE_REQUESTS':
        return {...state, storeRequests: action.payload}
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
        return {...state, products: [...state.products, ...action.payload]}
      case 'SET_ARCHIVED_PACKS':
        return {...state, packs: [...state.packs, ...action.payload]}
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