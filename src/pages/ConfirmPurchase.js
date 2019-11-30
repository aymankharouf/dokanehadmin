import React, { useContext, useMemo, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon, Badge, ListInput } from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import ReLogin from './ReLogin'
import { StoreContext } from '../data/Store';
import { confirmPurchase, stockOut, showMessage, showError, getMessage } from '../data/Actions'


const ConfirmPurchase = props => {
  const { state, user, dispatch } = useContext(StoreContext)
  const [error, setError] = useState('')
  const store = useMemo(() => state.stores.find(s => s.id === state.basket.storeId)
  , [state.basket, state.stores])
  const total = useMemo(() => state.basket.packs.reduce((sum, p) => sum + (p.purchasePrice * p.quantity), 0)
  , [state.basket])
  const [discount, setDiscount] = useState(store.discount ? (total * store.discount / 100000).toFixed(3) : 0)
  useEffect(() => {
    if (error) {
      showError(props, error)
      setError('')
    }
  }, [error, props])

  const handlePurchase = async () => {
    try{
      if (discount < 0) {
        throw new Error('invalidValue')
      }
      if (store.id === 's') {
        await stockOut(state.basket.packs, state.orders, state.storePacks, state.packs, state.labels.fixedFeesPercent, state.customers, state.labels.maxDiscount)
        showMessage(props, state.labels.purchaseSuccess)
        props.f7router.navigate('/home/', {reloadAll: true})
        dispatch({type: 'CLEAR_BASKET'})    
      } else {
        await confirmPurchase(state.basket.packs, state.orders, store.id, state.storePacks, state.packs, total, discount, state.labels.fixedFeesPercent, state.customers, state.labels.maxDiscount)
        showMessage(props, state.labels.purchaseSuccess)
        props.f7router.navigate('/home/', {reloadAll: true})
        dispatch({type: 'CLEAR_BASKET'})    
      }  
    } catch(err) {
			setError(getMessage(err, state.labels, props.f7route.route.component.name))
		}
  }
  if (!user) return <ReLogin />
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
                {p.quantity > 1 ? <Badge slot="title" color="red">{p.quantity}</Badge> : ''}
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
