const Reducer = (state, action) => {
    let otherPacks
    let pack
    switch (action.type){
      case 'ADD_TO_BASKET':
        pack = {
          packId: action.params.pack.id,
          price: action.params.price,
          quantity: action.params.quantity,
          actualPrice: action.params.packStore.price,
          purchasePrice: action.params.packStore.purchasePrice,
          requestedQuantity: action.params.requestedQuantity
        }
        if (!state.basket.storeId) {
          return {...state, basket: {storeId: action.params.packStore.storeId, packs: [pack]}}
        } else {
          if (state.basket.storeId !== action.params.packStore.storeId) return state
          if (state.basket.packs && state.basket.packs.find(p => p.id === action.params.pack.id)) return state
          return {...state, basket: {...state.basket, packs: [...state.basket.packs, pack]}}
        }
      case 'ADD_QUANTITY':
        pack = state.basket.packs.find(p => p.packId === action.pack.packId)
        otherPacks = state.basket.packs.filter(p => p.packId !== action.pack.packId)
        pack = {
          ...pack,
          quantity: pack.quantity + 1,
        }
        return {...state, basket: {...state.basket, packs: [...otherPacks, pack]}}
      case 'REMOVE_QUANTITY':
        pack = state.basket.packs.find(p => p.packId === action.pack.packId)
        otherPacks = state.basket.packs.filter(p => p.packId !== action.pack.packId)
        if (pack.quantity - 1 === 0) {
          if (otherPacks.length > 0){
            return {...state, basket: {...state.basket, packs: otherPacks}}
          } else {
            return {...state, basket: ''}
          }
        } else {
          pack = {
            ...pack,
            quantity: pack.quantity - 1,
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
      case 'CHANGE_ORDER_PACK':
        pack = state.orderBasket.find(p => p.packId === action.params.pack.packId)
        otherPacks = state.orderBasket.filter(p => p.packId !== action.params.pack.packId)
        pack = {
          ...pack,
          quantity: pack.quantity + action.params.value
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
      case 'SET_SECTIONS':
        return {
          ...state,
          sections: action.sections
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
      case 'SET_PRICE_ALARMS':
        return {
          ...state,
          priceAlarms: action.priceAlarms
        }
      case 'SET_FORGET_PASSWORD':
        return {
          ...state,
          forgetPassword: action.forgetPassword
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
      case 'SET_CANCEL_ORDERS':
        return {
          ...state,
          cancelOrders: action.cancelOrders
        }
      default:
        return state
    }
  }
  
  export default Reducer