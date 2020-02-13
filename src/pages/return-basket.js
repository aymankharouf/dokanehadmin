import React, { useContext, useEffect, useState } from 'react'
import { f7, Block, Fab, Page, Navbar, List, ListItem, Toolbar, Link, Icon, ListInput } from 'framework7-react'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { confirmReturnBasket, showMessage, showError, getMessage, quantityText } from '../data/actions'
import { stockTransTypes } from '../data/config'

const ReturnBasket = props => {
  const { state, dispatch } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [store] = useState(() => state.stores.find(s => s.id === state.returnBasket.storeId))
  const [basket, setBasket] = useState([])
  const [totalPrice, setTotalPrice] = useState('')
  const [discount, setDiscount] = useState('')
  const [storeId, setStoreId] = useState('')
  const [netPrice, setNetPrice] = useState('')
  const [stores] = useState(() => state.stores.filter(s => s.id !== 's'))
  useEffect(() => {
    setBasket(() => {
      let basket = state.returnBasket?.packs || []
      basket = basket.map(p => {
        const packInfo = state.packs.find(pa => pa.id === p.packId) || ''
        return {
          ...p,
          packInfo
        }
      })
      return basket.sort((p1, p2) => p1.time - p2.time)
    })
    setTotalPrice(() => state.returnBasket.packs?.reduce((sum, p) => sum + Math.trunc(p.cost * (p.weight || p.quantity)), 0) || 0)
  }, [state.returnBasket, state.packs])
  useEffect(() => {
    setDiscount(() => {
      if (state.returnBasket.type === 'r') {
        const storeInfo = state.stores.find(s => s.id === state.returnBasket.storeId)
        return (Math.trunc(totalPrice * (storeInfo.discount || 0)) / 1000).toFixed(3)  
      } else {
        return 0
      }
    })
  }, [state.returnBasket, state.stores, totalPrice])
  useEffect(() => {
    setNetPrice(totalPrice - (discount * 1000 || 0))
  }, [totalPrice, discount])
  useEffect(() => {
    if (!state.returnBasket) props.f7router.navigate('/home/', {reloadAll: true})
  }, [state.returnBasket, props])
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
  const handleSubmit = async () => {
    try{
      setInprocess(true)
      await confirmReturnBasket(state.returnBasket, storeId || state.returnBasket.storeId, discount, state.orders, state.stockTrans, state.storePacks, state.packs, state.purchases)
      setInprocess(false)
      dispatch({type: 'CLEAR_RETURN_BASKET'})
      showMessage(labels.executeSuccess)
      props.f7router.back()
    } catch(err) {
      setInprocess(false)
			setError(getMessage(props, err))
		}
  }
  let i = 0  
  return (
    <Page>
      <Navbar title={`${labels.basket} ${stockTransTypes.find(t => t.id === state.returnBasket.type)?.name} ${store?.name || ''}`} backLink={labels.back} />
      <Block>
        <List mediaList>
          {basket.map(p => 
            <ListItem
              title={p.packInfo.productName}
              subtitle={p.packInfo.productAlias}
              text={p.packInfo.name}
              footer={`${labels.grossPrice}: ${(Math.trunc(p.cost * p.quantity) / 1000).toFixed(3)}`}
              key={i++}
            >
              <div className="list-subtext1">{`${labels.unitPrice}: ${(p.cost / 1000).toFixed(3)}`}</div>
              <div className="list-subtext2">{`${labels.quantity}: ${quantityText(p.quantity, p.weight)}`}</div>
              <Link slot="after" iconMaterial="delete" iconColor="red" onClick={()=> dispatch({type: 'REMOVE_FROM_RETURN_BASKET', pack: p})}/>
            </ListItem>
          )}
        </List>
        <List form>
          {state.returnBasket.type === 's' ? 
            <ListItem
              title={labels.store}
              smartSelect
              smartSelectParams={{
                openIn: "popup", 
                closeOnSelect: true, 
                searchbar: true, 
                searchbarPlaceholder: labels.search,
                popupCloseLinkText: labels.close
              }}
            >
              <select name="storeId" value={storeId} onChange={e => setStoreId(e.target.value)}>
                <option value=""></option>
                {stores.map(s => 
                  <option key={s.id} value={s.id}>{s.name}</option>
                )}
              </select>
            </ListItem>
          : ''}

          {['r', 's'].includes(state.returnBasket.type) ? 
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
          : ''}
        </List>
      </Block>
      {state.returnBasket.type === 's' && !storeId ? '' :
        <Fab position="center-bottom" slot="fixed" text={`${labels.submit} ${(netPrice / 1000).toFixed(3)}`} color="green" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
      <Toolbar bottom>
        <Link href='/home/' iconMaterial="home" />
        <Link href='#' iconMaterial="delete" onClick={() => dispatch({type: 'CLEAR_RETURN_BASKET'})} />
      </Toolbar>
    </Page>
  )
}
export default ReturnBasket
