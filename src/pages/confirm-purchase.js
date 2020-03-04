import React, { useContext, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon, Link } from 'framework7-react'
import { StoreContext } from '../data/store'
import { confirmPurchase, stockOut, showMessage, showError, getMessage, quantityText } from '../data/actions'
import labels from '../data/labels'


const ConfirmPurchase = props => {
  const { state, dispatch } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [store] = useState(() => state.stores.find(s => s.id === state.basket.storeId))
  const [basket] = useState(() => state.basket.packs.map(p => {
    const packInfo = state.packs.find(pa => pa.id === p.packId)
    return {
      ...p,
      packInfo,
    }
  }))
  const [total] = useState(() => state.basket.packs.reduce((sum, p) => sum + Math.trunc(p.cost * (p.weight || p.quantity)), 0))
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handlePurchase = () => {
    try{
      if (store.id === 's') {
        stockOut(state.basket.packs, state.orders, state.packPrices, state.packs)
        showMessage(labels.purchaseSuccess)
        props.f7router.navigate('/home/', {reloadAll: true})
        dispatch({type: 'CLEAR_BASKET'})    
      } else {
        confirmPurchase(state.basket.packs, state.orders, store, state.packPrices, state.packs, total)
        showMessage(labels.purchaseSuccess)
        props.f7router.navigate('/home/', {reloadAll: true})
        dispatch({type: 'CLEAR_BASKET'})    
      }  
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  const handleDelete = () => {
    props.f7router.navigate('/home/', {reloadAll: true})
    dispatch({type: 'CLEAR_BASKET'})  
  }
  let i = 0
  return(
    <Page>
    <Navbar title={`${labels.confirmPurchase} ${store.name}`} backLink={labels.back} />
    <Block>
      <List mediaList>
        {basket.map(p => 
          <ListItem 
            key={i++} 
            title={p.packInfo.productName}
            subtitle={p.packInfo.productAlias}
            text={p.packInfo.name}
            footer={`${labels.quantity}: ${quantityText(p.quantity, p.weight)}`}
            after={((p.cost * (p.weight || p.quantity)) / 1000).toFixed(3)}
          >
            <div className="list-subtext1">{`${labels.unitPrice}: ${(p.cost / 1000).toFixed(3)}`}</div>
          </ListItem>
        )}
        <ListItem 
          title={labels.total} 
          className="total" 
          after={(total / 1000).toFixed(3)} 
        />
        <ListItem 
          title={labels.net} 
          className="net" 
          after={(total / 1000).toFixed(3)} 
        />
      </List>
    </Block>
    <Fab position="center-bottom" slot="fixed" text={labels.confirm} color="green" onClick={() => handlePurchase()}>
      <Icon material="done"></Icon>
    </Fab>
    <Toolbar bottom>
      <Link href='/home/' iconMaterial="home" />
      <Link href='#' iconMaterial="delete" onClick={() => handleDelete()} />
    </Toolbar>
  </Page>
  )
}
export default ConfirmPurchase
