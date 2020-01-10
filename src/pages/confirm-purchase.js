import React, { useContext, useMemo, useState, useEffect } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon, ListInput } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import { confirmPurchase, stockOut, showMessage, showError, getMessage, quantityText } from '../data/actions'
import labels from '../data/labels'


const ConfirmPurchase = props => {
  const { state, dispatch } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const store = useMemo(() => state.stores.find(s => s.id === state.basket.storeId)
  , [state.basket, state.stores])
  const basket = useMemo(() => {
    const basket = state.basket.packs.map(p => {
      const packInfo = state.packs.find(pa => pa.id === p.packId)
      const weightText = p.weight && p.weight !== p.quantity ? `(${quantityText(p.weight)})` : '' 
      return {
        ...p,
        packInfo,
        weightText
      }
    })
    return basket.sort((p1, p2) => p1.time - p2.time)
  }, [state.basket, state.packs])
  const total = useMemo(() => state.basket.packs.reduce((sum, p) => sum + parseInt(p.cost * (p.weight || p.quantity)), 0)
  , [state.basket])
  const [discount, setDiscount] = useState((total * (store.discount || 0) / 100000).toFixed(3))
  let i = 0
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  useEffect(() => {
    if (inprocess) {
      f7.dialog.preloader(labels.inprocess)
    } else {
      f7.dialog.close()
    }
  }, [inprocess])

  const handlePurchase = async () => {
    try{
      if (store.id === 's') {
        setInprocess(true)
        await stockOut(state.basket.packs, state.orders, state.storePacks, state.packs, state.customers)
        setInprocess(false)
        showMessage(labels.purchaseSuccess)
        props.f7router.navigate('/home/', {reloadAll: true})
        dispatch({type: 'CLEAR_BASKET'})    
      } else {
        setInprocess(true)
        await confirmPurchase(state.basket.packs, state.orders, store.id, state.storePacks, state.packs, state.customers, total, discount)
        setInprocess(false)
        showMessage(labels.purchaseSuccess)
        props.f7router.navigate('/home/', {reloadAll: true})
        dispatch({type: 'CLEAR_BASKET'})    
      }  
    } catch(err) {
      setInprocess(false)
			setError(getMessage(props, err))
		}
  }
  return(
    <Page>
    <Navbar title={`${labels.confirmPurchase} ${store.name}`} backLink={labels.back} />
    <Block>
      <List mediaList>
        {basket.map(p => 
          <ListItem 
            key={i++} 
            title={p.packInfo.productName}
            subtitle={p.packInfo.name}
            text={`${labels.unitPrice}: ${(p.cost / 1000).toFixed(3)}`}
            footer={`${labels.quantity}: ${quantityText(p.quantity)} ${p.weightText}`}
            after={((p.cost * (p.weight || p.quantity)) / 1000).toFixed(3)}
          />
        )}
        <ListItem 
          title={labels.total} 
          className="total" 
          after={(total / 1000).toFixed(3)} 
        />
        {store.id === 's' ? '' :
          <ListInput 
            name="discount" 
            label={labels.discount}
            value={discount}
            clearButton
            floatingLabel 
            type="number" 
            onChange={e => setDiscount(e.target.value)}
            onInputClear={() => setDiscount('')}
          />
        }
        <ListItem 
          title={labels.net} 
          className="net" 
          after={((total - (discount * 1000)) / 1000).toFixed(3)} 
        />
      </List>
    </Block>
    <Fab position="center-bottom" slot="fixed" text={labels.confirm} color="green" onClick={() => handlePurchase()}>
      <Icon material="done"></Icon>
    </Fab>
    <Toolbar bottom>
      <BottomToolbar/>
    </Toolbar>
  </Page>
  )
}
export default ConfirmPurchase
