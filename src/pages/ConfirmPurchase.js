import React, { useContext, useMemo, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon, ListInput } from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import ReLogin from './ReLogin'
import { StoreContext } from '../data/Store';
import { confirmPurchase, stockOut, showMessage, showError, getMessage, quantityText } from '../data/Actions'


const ConfirmPurchase = props => {
  const { state, user, dispatch } = useContext(StoreContext)
  const [error, setError] = useState('')
  const store = useMemo(() => state.stores.find(s => s.id === state.basket.storeId)
  , [state.basket, state.stores])
  const total = useMemo(() => state.basket.packs.reduce((sum, p) => sum + parseInt(p.cost * (p.weight ?? p.quantity)), 0)
  , [state.basket])
  const [discount, setDiscount] = useState((total * (store.discount ?? 0) / 100000).toFixed(3))
  let i = 0
  useEffect(() => {
    if (error) {
      showError(props, error)
      setError('')
    }
  }, [error, props])

  const handlePurchase = async () => {
    try{
      if (store.id === 's') {
        await stockOut(state.basket.packs, state.orders, state.storePacks, state.packs, state.customers)
        showMessage(props, state.labels.purchaseSuccess)
        props.f7router.navigate('/home/', {reloadAll: true})
        dispatch({type: 'CLEAR_BASKET'})    
      } else {
        await confirmPurchase(state.basket.packs, state.orders, store.id, state.storePacks, state.packs, total, discount, state.customers)
        showMessage(props, state.labels.purchaseSuccess)
        props.f7router.navigate('/home/', {reloadAll: true})
        dispatch({type: 'CLEAR_BASKET'})    
      }  
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  if (!user) return <ReLogin />
  return(
    <Page>
    <Navbar title={`${state.labels.confirmPurchase} ${store.name}`} backLink={state.labels.back} />
    <Block>
        <List mediaList>
          {state.basket.packs && state.basket.packs.map(p => {
            const packInfo = state.packs.find(pa => pa.id === p.packId)
            const productInfo = state.products.find(pr => pr.id === packInfo.productId)
            return (
              <ListItem 
                key={i++} 
                title={productInfo.name}
                subtitle={packInfo.name}
                text={`${state.labels.unitPrice}: ${(p.cost / 1000).toFixed(3)}`}
                footer={`${state.labels.quantity}: ${quantityText(p.quantity)}`}
                after={((p.cost * (p.weight ?? p.quantity)) / 1000).toFixed(3)}
              >
                {p.weight ? <div className="list-subtext1">{`${state.labels.weight}: ${quantityText(p.weight)}`}</div> : ''}
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
              onChange={e => setDiscount(e.target.value)}
              onInputClear={() => setDiscount('')}
            />
          }
          <ListItem 
            title={state.labels.net} 
            className="net" 
            after={((total - (discount * 1000)) / 1000).toFixed(3)} 
          />
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
