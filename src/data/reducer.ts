import {Action, State, Region, Country, Trademark, PasswordRequest, ProductRequest, PackRequest, Log} from "./types"

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
      case 'SET_STORES':
        return {...state, stores: action.payload}
      case 'SET_CATEGORIES':
        return {...state, categories: action.payload}
      case 'SET_USERS':
        return {...state, users: action.payload}
      case 'SET_PASSWORD_REQUESTS':
        const passwordRequests: PasswordRequest[] = action.payload
        return {...state, passwordRequests: passwordRequests.sort((r1, r2) => r1.time > r2.time ? -1 : 1)}
      case 'SET_PRODUCT_REQUESTS':
        const productRequests: ProductRequest[] = action.payload
        return {...state, productRequests: productRequests.sort((r1, r2) => r1.time > r2.time ? -1 : 1)}
      case 'SET_PACK_REQUESTS':
        const packRequests: PackRequest[] = action.payload
        return {...state, packRequests: packRequests.sort((r1, r2) => r1.time > r2.time ? -1 : 1)}
      case 'SET_STORE_REQUESTS':
        return {...state, storeRequests: action.payload}
      case 'SET_PRODUCTS':
        return {...state, products: action.payload}
      case 'SET_PACKS':
        return {...state, packs: action.payload}
      case 'SET_PACK_STORES':
        return {...state, packStores: action.payload}
      case 'SET_LOGS':
        const logs: Log[] = action.payload
        return {...state, logs: logs.sort((l1, l2) => l1.time > l2.time ? -1 : 1)}
      case 'SET_ADVERTS':
        return {...state, adverts: action.payload}
      case 'SET_ARCHIVED_PRODUCTS':
        return {...state, products: [...state.products, ...action.payload]}
      case 'SET_ARCHIVED_PACKS':
        return {...state, packs: [...state.packs, ...action.payload]}
      case 'LOGIN':
        return {...state, user: action.payload}
      case 'LOGOUT':
        return {...state, user: undefined}
      case 'SET_SEARCH':
        return {...state, searchText: action.payload}
      case 'CLEAR_SEARCH':
        return {...state, searchText: ''}
      default:
        return state
    }
  }
  
  export default Reducer