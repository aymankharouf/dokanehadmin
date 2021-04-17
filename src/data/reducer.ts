import { Action, State } from "./interfaces"

const Reducer = (state: State, action: Action) => {
    let pack, packIndex, packs, nextQuantity
    switch (action.type){
      case 'ADD_TO_BASKET':
        pack = {
          packId: action.payload.pack.id,
          productName: action.payload.pack.productName,
          productAlias: action.payload.pack.productAlias,
          packName: action.payload.pack.name,
          imageUrl: action.payload.pack.imageUrl,
          price: action.payload.price,
          quantity: action.payload.quantity,
          actual: action.payload.packStore.price,
          cost: action.payload.packStore.cost,
          requested: action.payload.quantity,
          orderId: action.payload.orderId,
          weight: action.payload.weight,
          isOffer: action.payload.packStore.isOffer,
          exceedPriceType: action.payload.exceedPriceType,
          isDivided: action.payload.pack.isDivided,
          closeExpired: action.payload.pack.closeExpired,
          refPackId: action.payload.refPackId,
          refPackQuantity: action.payload.refPackQuantity
        }
        if (!state.basket.storeId) {
          return {...state, basket: {storeId: action.payload.packStore.storeId, packs: [pack]}}
        } else {
          return {...state, basket: {...state.basket, packs: [...state.basket.packs, pack]}}
        }
      case 'INCREASE_QUANTITY':
        pack = {
          ...action.payload,
          quantity: action.payload.quantity + 1
        }
        packs = state.basket.packs.slice()
        packIndex = packs.findIndex((p: any) => p.packId === action.payload.packId)
        packs.splice(packIndex, 1, pack)
        return {...state, basket: {...state.basket, packs}}
      case 'DECREASE_QUANTITY':
        packs = state.basket.packs.slice()
        if (action.payload.isDivided) {
          nextQuantity = 0
          packIndex = packs.findIndex((p: any) => p.packId === action.payload.packId && p.orderId === action.payload.orderId)
        } else {
          nextQuantity = action.payload.quantity - 1
          packIndex = packs.findIndex((p: any) => p.packId === action.payload.packId)
        }
        if (nextQuantity === 0) {
          packs.splice(packIndex, 1)
          if (packs.length === 0){
            return {...state, basket: ''}
          }
        } else {
          pack = {
            ...action.payload,
            quantity: nextQuantity
          }
          packs.splice(packIndex, 1, pack)
        }
        return {...state, basket: {...state.basket, packs}}
      case 'CLEAR_BASKET':
        return {...state, basket: ''}
      case 'LOAD_ORDER_BASKET':
        return {
          ...state,
          orderBasket: action.payload.order.basket.map((p: any) => {
            return {
              ...p,
              quantity: action.payload.type === 'e' ? p.quantity : p.purchased,
              oldQuantity: action.payload.type === 'e' ? p.quantity : p.purchased
            }
          })
        }
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