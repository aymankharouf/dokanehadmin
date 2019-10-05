import React, { useContext } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon, Badge} from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import ReLogin from './ReLogin'
import { StoreContext } from '../data/Store';
import { confirmPurchase, stockOut } from '../data/Actions'


const ConfirmPurchase = props => {
  const { state, user, dispatch } = useContext(StoreContext)
  const store = state.basket.store ? state.stores.find(rec => rec.id === state.basket.store.id) : null
  const total = state.basket.packs ? state.basket.packs.reduce((a, pack) => a + pack.netPrice, 0) : 0
  const handlePurchase = () => {
    const basket = state.basket.packs.map(pack => {
      return ({
        id: pack.id,
        quantity: pack.quantity,
        price: pack.price,
        actualPrice: pack.actualPrice,
        purchasePrice: pack.purchasePrice,
        stores: pack.stores
      })
    })
    const approvedOrders = state.orders.filter(rec => rec.status === 'a' || rec.status === 'e')
    if (state.basket.storeId === 's') {
      stockOut(approvedOrders, basket, state.packTrans).then(() => {
        props.f7router.navigate('/home/')
        dispatch({type: 'CLEAR_BASKET'})    
      })
    } else { 
      confirmPurchase(approvedOrders, state.basket.storeId, basket, state.packTrans, total).then(() => {
        props.f7router.navigate('/home/')
        dispatch({type: 'CLEAR_BASKET'})    
      })
    }
  }
  if (!user) return <ReLogin callingPage="confirmPurchase"/>
  return(
    <Page>
    <Navbar title={`${state.labels.confirmPurchase} ${store ? store.name: ''}`} backLink={state.labels.back} />
    <Block>
        <List>
          {state.basket.packs && state.basket.packs.map(pack => 
            <ListItem 
              key={pack.id} 
              title={state.products.find(rec => rec.id === pack.productId).name}
              footer={pack.name} 
              after={(pack.netPrice / 1000).toFixed(3)}
            >
              {pack.quantity > 1 ? <Badge slot="title" color="red">{pack.quantity}</Badge> : null}
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
