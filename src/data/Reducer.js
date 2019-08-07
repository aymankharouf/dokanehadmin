const Reducer = (state, action) => {
    let newQuantity
    let otherProducts
    switch (action.type){
      case 'ADD_TO_BASKET':
        const product = {...action.basket.product, quantity: action.basket.quantity, netPrice: parseFloat(action.basket.product.price * action.basket.quantity).toFixed(3)}
        if (!state.basket.store) {
          return {...state, basket: {store: action.basket.store, products: [product]}}
        } else {
          if (state.basket.store.id !== action.basket.store.id) return state
          if (state.basket.products && state.basket.products.find(product => product.id === action.basket.product.id)) return state
          return {...state, basket: {...state.basket, products: [...state.basket.products, product]}}
        }
      case 'ADD_QUANTITY':
        newQuantity = state.basket.products.find(product => product.id === action.product.id).quantity
        otherProducts = state.basket.products.filter(product => product.id !== action.product.id)
        return {...state, basket: {...state.basket, products: [...otherProducts, {...action.product, quantity: ++newQuantity, netPrice: parseFloat(newQuantity * action.product.price).toFixed(3)}]}}
      case 'REMOVE_QUANTITY':
        newQuantity = state.basket.products.find(product => product.id === action.product.id).quantity--
        otherProducts = state.basket.products.filter(product => product.id !== action.product.id)
        if (--newQuantity === 0) {
          if (otherProducts.length > 0){
            return {...state, basket: {...state.basket, products: otherProducts}}
          } else {
            return {...state, basket: ''}
          }
        }
        else return {...state, basket: {...state.basket, products: [...otherProducts, {...action.product, quantity: newQuantity, netPrice: parseFloat(newQuantity * action.product.price).toFixed(3)}]}}
      case 'CLEAR_BASKET':
        return {
          ...state,
          basket: ''
        }
      case 'UPDATE_ORDER':
        const order = state.orders.find(rec => rec.id === action.order.orderId)
        const otherOrders = state.orders.filter(rec => rec.id !== action.order.orderId)
        let orderProduct = order.basket.find(rec => rec.id === action.order.productId)
        const otherOrderProducts = order.basket.filter(rec => rec.id !== action.order.productId)
        orderProduct = {...orderProduct, status: 'b'}
        return {
          ...state,
          orders: [...otherOrders, {...order, status: 'e', basket: [...otherOrderProducts, orderProduct]}]
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