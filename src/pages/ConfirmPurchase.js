import React, { useContext, useMemo, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon, Badge, ListInput } from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import ReLogin from './ReLogin'
import { StoreContext } from '../data/Store';
import { confirmPurchase, stockOut, showMessage } from '../data/Actions'


const ConfirmPurchase = props => {
  const { state, user, dispatch } = useContext(StoreContext)
  const store = useMemo(() => state.stores.find(s => s.id === state.basket.storeId)
  , [state.basket, state.stores])
  const total = useMemo(() => state.basket.packs.reduce((sum, p) => sum + (p.purchasePrice * p.quantity), 0)
  , [state.basket])
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
    const basket = state.basket.packs.map(p => {
      return ({
        ...p,
        stores: state.packs.find(pa => pa.id === p.packId).stores
      })
    })
    const approvedOrders = state.orders.filter(o => o.status === 'a' || o.status === 'e')
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
          {state.basket.packs && state.basket.packs.map(p => {
            const packInfo = state.packs.find(pa => pa.id === p.packId)
            const productInfo = state.products.find(pr => pr.id === packInfo.productId)
            return (
              <ListItem 
                key={p.packId} 
                title={productInfo.name}
                footer={packInfo.name} 
                after={((p.purchasePrice * p.quantity) / 1000).toFixed(3)}
              >
                {p.quantity > 1 ? <Badge slot="title" color="red">{p.quantity}</Badge> : null}
              </ListItem>
            )
          }
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
