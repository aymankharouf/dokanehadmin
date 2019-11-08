const Reducer = (state, action) => {
    let newQuantity
    let otherPacks
    let pack
    switch (action.type){
      case 'ADD_TO_BASKET':
        pack = {
          ...action.basket.pack,
          price: action.basket.price,
          quantity: action.basket.quantity,
          actualPrice: action.basket.store.price,
          purchasePrice: action.basket.store.purchasePrice,
          netPrice: action.basket.store.purchasePrice * action.basket.quantity
        }
        if (!state.basket.storeId) {
          return {...state, basket: {storeId: action.basket.store.id, packs: [pack]}}
        } else {
          if (state.basket.storeId !== action.basket.store.id) return state
          if (state.basket.packs && state.basket.packs.find(rec => rec.id === action.basket.pack.id)) return state
          return {...state, basket: {...state.basket, packs: [...state.basket.packs, pack]}}
        }
      case 'ADD_QUANTITY':
        pack = state.basket.packs.find(rec => rec.id === action.pack.id)
        newQuantity = pack.quantity
        otherPacks = state.basket.packs.filter(rec => rec.id !== action.pack.id)
        pack = {
          ...pack,
          quantity: ++newQuantity,
          netPrice: newQuantity * pack.purchasePrice
        }
        return {...state, basket: {...state.basket, packs: [...otherPacks, pack]}}
      case 'REMOVE_QUANTITY':
        pack = state.basket.packs.find(rec => rec.id === action.pack.id)
        newQuantity = pack.quantity
        otherPacks = state.basket.packs.filter(rec => rec.id !== action.pack.id)
        if (--newQuantity === 0) {
          if (otherPacks.length > 0){
            return {...state, basket: {...state.basket, packs: otherPacks}}
          } else {
            return {...state, basket: ''}
          }
        } else {
          pack = {
            ...pack,
            quantity: newQuantity,
            netPrice: newQuantity * pack.purchasePrice
          }  
          return {...state, basket: {...state.basket, packs: [...otherPacks, pack]}}
        }
      case 'CLEAR_BASKET':
        return {
          ...state,
          basket: ''
        }
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
      case 'SET_PACK_TRANS':
        return {
          ...state,
          packTrans: action.packTrans
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
      case 'SET_COST_TYPES':
        return {
          ...state,
          costTypes: action.costTypes
        }
      case 'SET_COSTS':
        return {
          ...state,
          costs: action.costs
        }
      default:
        return state
    }
  }

  export default Reducer