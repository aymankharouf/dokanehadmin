import React, { useContext } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon, Badge} from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import ReLogin from './ReLogin'
import { StoreContext } from '../data/Store';
import { confirmPurchase, stockOut } from '../data/Actions'


const ConfirmPurchase = props => {
  const { state, user, dispatch } = useContext(StoreContext)
  const store = state.basket.store ? state.stores.find(rec => rec.id === state.basket.store.id) : null
  const total = state.basket.products ? state.basket.products.reduce((a, product) => a + product.netPrice, 0) : 0
  const handlePurchase = () => {
    const basket = state.basket.products.map(product => {
      return ({
        id: product.id,
        quantity: product.quantity,
        price: product.price,
        actualPrice: product.actualPrice,
        purchasePrice: product.purchasePrice,
        stores: product.stores
      })
    })
    const approvedOrders = state.orders.filter(rec => rec.status === 'a' || rec.status === 'e')
    if (state.basket.storeId === 's') {
      stockOut(approvedOrders, basket, state.productTrans).then(() => {
        props.f7router.navigate('/home/')
        dispatch({type: 'CLEAR_BASKET'})    
      })
    } else { 
      confirmPurchase(approvedOrders, state.basket.storeId, basket, state.productTrans, total).then(() => {
        props.f7router.navigate('/home/')
        dispatch({type: 'CLEAR_BASKET'})    
      })
    }
  }
  if (!user) return <ReLogin callingPage="confirmPurchase"/>
  return(
    <Page>
    <Navbar title={`${state.labels.confirmPurchase} ${store ? store.name: ''}`} backLink="Back" />
    <Block>
        <List>
          {state.basket.products && state.basket.products.map(product => 
            <ListItem 
              key={product.id} 
              title={product.name}
              footer={product.description} 
              after={(product.netPrice / 1000).toFixed(3)}
            >
              {product.quantity > 1 ? <Badge slot="title" color="red">{product.quantity}</Badge> : null}
            </ListItem>
          )}
          <ListItem title={state.labels.total} className="total" after={(total / 1000).toFixed(3)} />
        </List>
    </Block>
    <Fab position="center-bottom" slot="fixed" text={state.labels.confirm} color="green" onClick={() => handlePurchase()}>
      <Icon ios="f7:check" aurora="f7:check" md="material:done"></Icon>
    </Fab>
    <Toolbar bottom>
      <BottomToolbar/>
    </Toolbar>
  </Page>
  )
}
export default ConfirmPurchase
