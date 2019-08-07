import React, { useContext, useState } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon} from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import ReLogin from './ReLogin'
import { StoreContext } from '../data/Store';
import { confirmPurchase, updateOrder } from '../data/Actions'


const ConfirmPurchase = props => {
  const { state, user, orders, dispatch } = useContext(StoreContext)
  const store = state.basket.store ? state.stores.find(rec => rec.id === state.basket.store.id) : null
  const totalPrice = state.basket.products ? state.basket.products.reduce((a, product) => a + Number(product.netPrice), 0) : 0
  const handlePurchase = () => {
    const purchase = {
      store: state.basket.store,
      basket: state.basket.products,
      total: parseFloat(totalPrice + 0.25).toFixed(3),
      time: new Date()
    }
    confirmPurchase(purchase).then(() => {
      const approvedOrders = orders.filter(rec => rec.status === 'a' || rec.status === 'e')
      state.basket.products.forEach(product => {
        let remainingQuantity = product.quantity
        const inOrders = approvedOrders.filter(order => order.basket.find(rec => rec.id === product.id))
        inOrders.forEach(order => {
          const orderProduct = order.basket.find(rec => rec.id === product.id)
          const otherProducts = order.basket.filter(rec => rec.id !== product.id)
          let purchasedQuantity
          let orderStatus = 'e'
          if (remainingQuantity > 0){
            if (remainingQuantity >= orderProduct.quantity - (orderProduct.purchasedQuantity || 0)) {
              purchasedQuantity = orderProduct.quantity - (orderProduct.purchasedQuantity || 0)
              if (otherProducts.length === otherProducts.filter(rec => rec.quantity === rec.purchasedQuantity).length) {
                orderStatus = 'f'
              }
            } else {
              purchasedQuantity = orderProduct.quantity - (orderProduct.purchasedQuantity || 0) - remainingQuantity
            }
            const newOrder = {...order, status: orderStatus, basket: [...otherProducts, {...orderProduct, purchasedQuantity: purchasedQuantity}]}
            updateOrder(newOrder).then(() => {
              remainingQuantity -=  purchasedQuantity
            })
          }
        })
      })
      props.f7router.navigate('/home/')
      dispatch({type: 'CLEAR_BASKET'})
    })
  }
  if (!user) return <ReLogin callingPage="order"/>
  return(
    <Page>
    <Navbar title={`Purchase from ${store ? store.name: ''}`} backLink="Back" />
    <Block>
        <List>
          {state.basket.products && state.basket.products.map(product => 
            <ListItem 
              key={product.id} 
              title={`${product.name} (${product.quantity})`} 
              after={product.netPrice}
            ></ListItem>
          )}
          <ListItem title="Total" className="total" after={parseFloat(totalPrice).toFixed(3)}></ListItem>
        </List>
    </Block>
    <Fab position="center-bottom" slot="fixed" text='اعتماد' color="red" onClick={() => handlePurchase()}>
      <Icon ios="f7:check" aurora="f7:check" md="material:done"></Icon>
    </Fab>
    <Toolbar bottom>
      <BottomToolbar/>
    </Toolbar>
  </Page>
  )
}
export default ConfirmPurchase
