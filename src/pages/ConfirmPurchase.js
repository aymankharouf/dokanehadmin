import React, { useContext, useMemo, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon, Badge, ListInput } from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import ReLogin from './ReLogin'
import { StoreContext } from '../data/Store';
import { confirmPurchase, stockOut, showMessage } from '../data/Actions'


const ConfirmPurchase = props => {
  const { state, user, dispatch } = useContext(StoreContext)
  const store = useMemo(() => state.stores.find(rec => rec.id === state.basket.storeId), [state.basket, state.stores])
  const total = useMemo(() => state.basket.packs.reduce((a, pack) => a + (pack.purchasePrice * pack.quantity), 0), [state.basket])
  const [discount, setDiscount] = useState('')
  const [discountErrorMessage, setDiscountErrorMessage] = useState('')
  useEffect(() => {
    const validateDiscount = value => {
      if (value > 0 && value < total){
        setDiscountErrorMessage('')
      } else {
        setDiscountErrorMessage(state.labels.invalidValue)
      }
    }
    if (discount) validateDiscount(discount)
  }, [discount, state.labels, total])

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
    if (store.id === 's') {
      stockOut(approvedOrders, basket).then(() => {
        showMessage(props, 'success', state.labels.purchaseSuccess)
        props.f7router.navigate('/home/', {reloadAll: true})
        dispatch({type: 'CLEAR_BASKET'})    
      })
    } else { 
      confirmPurchase(approvedOrders, store.id, basket, total, discount).then(() => {
        showMessage(props, 'success', state.labels.purchaseSuccess)
        props.f7router.navigate('/home/', {reloadAll: true})
        dispatch({type: 'CLEAR_BASKET'})    
      })
    }
  }
  if (!user) return <ReLogin callingPage="confirmPurchase"/>
  return(
    <Page>
    <Navbar title={`${state.labels.confirmPurchase} - ${store.name}`} backLink={state.labels.back} />
    <Block>
        <List>
          {state.basket.packs && state.basket.packs.map(pack => 
            <ListItem 
              key={pack.id} 
              title={state.products.find(rec => rec.id === pack.productId).name}
              footer={pack.name} 
              after={((pack.purchasePrice * pack.quantity) / 1000).toFixed(3)}
            >
              {pack.quantity > 1 ? <Badge slot="title" color="red">{pack.quantity}</Badge> : null}
            </ListItem>
          )}
          <ListItem 
            title={state.labels.total} 
            className="total" 
            after={(total / 1000).toFixed(3)} 
          />
          {store.id === 's' ? '' :
            <ListInput 
              name="discount" 
              label={state.labels.discount}
              value={discount}
              clearButton
              floatingLabel 
              type="number" 
              errorMessage={discountErrorMessage}
              errorMessageForce
              onChange={e => setDiscount(e.target.value)}
              onInputClear={() => setDiscount('')}
            />
          }
        </List>
    </Block>
    <Fab position="center-bottom" slot="fixed" text={state.labels.confirm} color="green" onClick={() => handlePurchase()}>
      <Icon material="done"></Icon>
    </Fab>
    <Toolbar bottom>
      <BottomToolbar/>
    </Toolbar>
  </Page>
  )
}
export default ConfirmPurchase
