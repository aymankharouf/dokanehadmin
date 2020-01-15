const Reducer = (state, action) => {
    let otherPacks
    let pack
    let nextQuantity
    const increment = [0.125, 0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7]
    switch (action.type){
      case 'ADD_TO_BASKET':
        pack = {
          packId: action.params.pack.id,
          price: action.params.price,
          quantity: action.params.quantity,
          actual: action.params.packStore.price,
          cost: action.params.packStore.cost,
          requested: action.params.requested,
          isDivided: action.params.pack.isDivided,
          orderId: action.params.orderId,
          weight: action.params.weight,
          isOffer: action.params.packStore.isOffer,
          exceedPriceType: action.params.exceedPriceType,
          time: new Date()
        }
        if (!state.basket.storeId) {
          return {...state, basket: {storeId: action.params.packStore.storeId, packs: [pack]}}
        } else {
          if (state.basket.storeId !== action.params.packStore.storeId) return state
          if (state.basket.packs && state.basket.packs.find(p => p.id === action.params.pack.id)) return state
          return {...state, basket: {...state.basket, packs: [...state.basket.packs, pack]}}
        }
      case 'INCREASE_QUANTITY':
        if (action.pack.orderId) {
          pack = state.basket.packs.find(p => p.packId === action.pack.packId && p.orderId === action.pack.orderId)
          otherPacks = state.basket.packs.filter(p => p.packId !== action.pack.packId || p.orderId !== action.pack.orderId)
        } else {
          pack = state.basket.packs.find(p => p.packId === action.pack.packId)
          otherPacks = state.basket.packs.filter(p => p.packId !== action.pack.packId)
        }
        if (!pack.isDivided && (!action.pack.orderId || !(pack.quantity + 1 > pack.requested))) {
          pack = {
            ...pack,
            quantity: pack.quantity + 1
          }
        }
        return {...state, basket: {...state.basket, packs: [...otherPacks, pack]}}
      case 'DECREASE_QUANTITY':
        if (action.pack.orderId) {
          pack = state.basket.packs.find(p => p.packId === action.pack.packId && p.orderId === action.pack.orderId)
          otherPacks = state.basket.packs.filter(p => p.packId !== action.pack.packId || p.orderId !== action.pack.orderId)
        } else {
          pack = state.basket.packs.find(p => p.packId === action.pack.packId)
          otherPacks = state.basket.packs.filter(p => p.packId !== action.pack.packId)
        }
        if (pack.isDivided) {
          nextQuantity = 0
        } else {
          nextQuantity = pack.quantity - 1
        }
        if (nextQuantity === 0) {
          if (otherPacks.length > 0){
            return {...state, basket: {...state.basket, packs: otherPacks}}
          } else {
            return {...state, basket: ''}
          }
        } else {
          pack = {
            ...pack,
            quantity: nextQuantity
          }  
          return {...state, basket: {...state.basket, packs: [...otherPacks, pack]}}
        }
      case 'CLEAR_BASKET':
        return {
          ...state,
          basket: ''
        }
      case 'LOAD_ORDER_BASKET':
        return {
          ...state,
          orderBasket: action.order.basket
        }
      case 'CLEAR_ORDER_BASKET':
        return {
          ...state,
          orderBasket: []
        }
      case 'INCREASE_ORDER_QUANTITY':
        pack = state.orderBasket.find(p => p.packId === action.pack.packId)
        otherPacks = state.orderBasket.filter(p => p.packId !== action.pack.packId)
        if (pack.isDivided) {
          nextQuantity = increment.filter(i => i > pack.quantity)
          nextQuantity = Math.min(...nextQuantity)
          nextQuantity = nextQuantity === Infinity ? pack.quantity : nextQuantity
        } else {
          nextQuantity = pack.quantity + 1
        }
        pack = {
          ...pack,
          quantity: nextQuantity,
          gross: parseInt(pack.price * nextQuantity)
        }
        return {...state, orderBasket: [...otherPacks, pack]}
      case 'DECREASE_ORDER_QUANTITY':
        pack = state.orderBasket.find(p => p.packId === action.pack.packId)
        otherPacks = state.orderBasket.filter(p => p.packId !== action.pack.packId)
        if (pack.weight) {
          if (pack.isDivided) {
            if (pack.quantity > pack.weight) {
              nextQuantity = pack.weight
            } else {
              nextQuantity = 0
            }  
          } else {
            if (pack.quantity > pack.purchased) {
              nextQuantity = pack.purchased
            } else {
              nextQuantity = 0
            }  
          }
        } else if (pack.isDivided) {
          nextQuantity = increment.filter(i => i < pack.quantity)
          nextQuantity = Math.max(...nextQuantity)
          nextQuantity = nextQuantity === -Infinity ? 0 : nextQuantity
        } else {
          nextQuantity = pack.quantity - 1
        }
        pack = {
          ...pack,
          quantity: nextQuantity,
          gross: parseInt(pack.price * nextQuantity)
        }  
        return {...state, orderBasket: [...otherPacks, pack]}
      case 'SET_COUNTRIES':
        return {
          ...state,
          countries: action.countries
        }
      case 'SET_STORES':
        return {
          ...state,
          stores: action.stores
        }
      case 'SET_CATEGORIES':
        return {
          ...state,
          categories: action.categories
        }
      case 'SET_TRADEMARKS':
        return {
          ...state,
          trademarks: action.trademarks
        }
      case 'SET_USERS':
        return {
          ...state,
          users: action.users
        }
      case 'SET_PURCHASES':
        return {
          ...state,
          purchases: action.purchases
        }
      case 'SET_ORDERS':
        return {
          ...state,
          orders: action.orders
        }
      case 'SET_STOCK_TRANS':
        return {
          ...state,
          stockTrans: action.stockTrans
        }
      case 'SET_ALARMS':
        return {
          ...state,
          alarms: action.alarms
        }
      case 'SET_PASSWORD_REQUESTS':
        return {
          ...state,
          passwordRequests: action.passwordRequests
        }
      case 'SET_INVITATIONS':
        return {
          ...state,
          invitations: action.invitations
        }
      case 'SET_PRODUCTS':
        return {
          ...state,
          products: action.products
        }
      case 'SET_PACKS':
        return {
          ...state,
          packs: action.packs
        }
      case 'SET_CUSTOMERS':
        return {
          ...state,
          customers: action.customers
        }
      case 'SET_SPENDINGS':
        return {
          ...state,
          spendings: action.spendings
        }
      case 'SET_MONTHLY_TRANS':
        return {
          ...state,
          monthlyTrans: action.monthlyTrans
        }
      case 'SET_COMMENTS':
        return {
          ...state,
          comments: action.comments
        }
      case 'SET_LOCATIONS':
        return {
          ...state,
          locations: action.locations
        }
      case 'SET_RATINGS':
        return {
          ...state,
          ratings: action.ratings
        }
      case 'SET_STORE_PACKS':
        return {
          ...state,
          storePacks: action.storePacks
        }
      case 'SET_ORDER_REQUESTS':
        return {
          ...state,
          orderRequests: action.orderRequests
        }
      case 'SET_LOGS':
        return {
          ...state,
          logs: action.logs
        }
      case 'SET_TAGS':
        return {
          ...state,
          tags: action.tags
        }
      case 'SET_NOTIFICATIONS':
        return {
          ...state,
          notifications: action.notifications
        }
      case 'SET_ARCHIVED_ORDERS':
        return {
          ...state,
          archivedOrders: action.orders
        }
      case 'SET_CALLS':
        return {
          ...state,
          calls: action.calls
        }
      case 'SET_ADVERTS':
        return {
          ...state,
          adverts: action.adverts
        }
      default:
        return state
    }
  }
  
  export default Reducer