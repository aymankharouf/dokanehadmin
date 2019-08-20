const Reducer = (state, action) => {
    let newQuantity
    let otherProducts
    let product
    switch (action.type){
      case 'ADD_TO_BASKET':
        product = {
          ...action.basket.product,
          price: action.basket.price,
          quantity: action.basket.quantity,
          actualPrice: action.basket.store.price,
          purchasePrice: action.basket.store.purchasePrice,
          netPrice: action.basket.store.purchasePrice * action.basket.quantity
        }
        if (!state.basket.storeId) {
          return {...state, basket: {storeId: action.basket.store.id, products: [product]}}
        } else {
          if (state.basket.storeId !== action.basket.store.id) return state
          if (state.basket.products && state.basket.products.find(product => product.id === action.basket.product.id)) return state
          return {...state, basket: {...state.basket, products: [...state.basket.products, product]}}
        }
      case 'ADD_QUANTITY':
        product = state.basket.products.find(product => product.id === action.product.id)
        newQuantity = product.quantity
        otherProducts = state.basket.products.filter(product => product.id !== action.product.id)
        product = {
          ...product,
          quantity: ++newQuantity,
          netPrice: newQuantity * product.purchasePrice
        }
        return {...state, basket: {...state.basket, products: [...otherProducts, product]}}
      case 'REMOVE_QUANTITY':
        product = state.basket.products.find(product => product.id === action.product.id)
        newQuantity = product.quantity
        otherProducts = state.basket.products.filter(product => product.id !== action.product.id)
        if (--newQuantity === 0) {
          if (otherProducts.length > 0){
            return {...state, basket: {...state.basket, products: otherProducts}}
          } else {
            return {...state, basket: ''}
          }
        } else {
          product = {
            ...product,
            quantity: newQuantity,
            netPrice: newQuantity * product.purchasePrice
          }  
          return {...state, basket: {...state.basket, products: [...otherProducts, product]}}
        }
      case 'CLEAR_BASKET':
        return {
          ...state,
          basket: ''
        }
      case 'ADD_COUNTRY':
        return {
          ...state,
          countries: [...state.countries, action.country]
        }
      case 'ADD_STORE':
        return {
          ...state,
          stores: [...state.stores, action.store]
        }
      case 'ADD_SECTION':
        return {
          ...state,
          sections: [...state.sections, action.section]
        }
      case 'ADD_CATEGORY':
        return {
          ...state,
          categories: [...state.categories, action.category]
        }
      case 'ADD_TRADEMARK':
        return {
          ...state,
          trademarks: [...state.trademarks, action.trademark]
        }
      case 'ADD_ORDER':
        return {
          ...state,
          orders: [...state.orders, action.order]
        }
      case 'DONE':
        return {
          ...state,
          result: {message: '', finished: true}
        }
      case 'ERROR':
        return {
          ...state,
          result: {message: action.message, finished: true}
        }
      case 'CLEAR_ERRORS':
        return {
          ...state,
          result: {message: '', finished: false}
        }
      default:
        return state
    }
  }

  export default Reducer