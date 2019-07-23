const Reducer = (state, action) => {
    let newQuantity
    let newBasket
    switch (action.type){
      case 'ADD_TO_BASKET':
        if (state.basket.find(product => product.id === action.product.id)) return state
        return {...state, basket: [...state.basket, {...action.product, quantity: 1, netPrice: action.product.price}]}
      case 'ADD_QUANTITY':
        newQuantity = state.basket.find(product => product.id === action.product.id).quantity
        newBasket = state.basket.filter(product => product.id !== action.product.id)
        return {...state, basket: [...newBasket, {...action.product, quantity: ++newQuantity, netPrice: newQuantity * action.product.price}]}
      case 'REMOVE_QUANTITY':
        newQuantity = state.basket.find(product => product.id === action.product.id).quantity--
        newBasket = state.basket.filter(product => product.id !== action.product.id)
        if (--newQuantity === 0) return {...state, basket: newBasket}
        else return {...state, basket: [...newBasket, {...action.product, quantity: newQuantity, netPrice: newQuantity * action.product.price}]}
      case 'CLEAR_BASKET':
        return {
          ...state,
          basket: []
        }
      case 'LOAD_BASKET':
        return {
          ...state,
          basket: action.order.basket
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