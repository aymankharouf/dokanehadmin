import React, { useContext, useEffect, useState } from 'react'
import { f7, Block, Fab, Page, Navbar, List, ListItem, Toolbar, Link, Icon, Stepper, ListInput } from 'framework7-react'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { confirmReturnBasket, showMessage, showError, getMessage, quantityText } from '../data/actions'

const ReturnBasket = props => {
  const { state, dispatch } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [store] = useState(() => state.stores.find(s => s.id === state.returnBasket.storeId))
  const [basket, setBasket] = useState([])
  const [totalPrice, setTotalPrice] = useState('')
  const [discount, setDiscount] = useState('')
  useEffect(() => {
    setBasket(() => {
      let basket = state.returnBasket?.packs || []
      basket = basket.map(p => {
        const packInfo = state.packs.find(pa => pa.id === p.packId) || ''
        const weightText = p.weight && p.weight !== p.purchasedQuantity ? `(${quantityText(p.weight)})` : '' 
        return {
          ...p,
          packInfo,
          weightText
        }
      })
      return basket.sort((p1, p2) => p1.time - p2.time)
    })
    setTotalPrice(() => state.returnBasket.packs?.reduce((sum, p) => sum + parseInt(p.cost * (p.weight || p.returnedQuantity)), 0) || 0)
  }, [state.returnBasket, state.packs])
  useEffect(() => {
    setDiscount(() => {
      const storeInfo = state.stores.find(s => s.id === state.returnBasket.storeId) || ''
      return (totalPrice * storeInfo.discount / 1000).toFixed(3)
    })
  }, [state.returnBasket, state.stores, totalPrice])
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
  const handleAdd = pack => {
    if (pack.returnedQuantity < pack.remainQuantity) {
      dispatch({type: 'INCREASE_RETURN_QUANTITY', pack})
    }
  }
  const handleSubmit = async () => {
    try{
      setInprocess(true)
      await confirmReturnBasket(state.returnBasket, discount, state.orders, state.stockTrans, state.storePacks, state.packs, state.stores)
      setInprocess(false)
      showMessage(labels.addToBasketSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  let i = 0  
  return (
    <Page>
      <Navbar title={`${labels.returnBasketFrom} ${store?.name}`} backLink={labels.back} />
      <Block>
        <List mediaList>
          {basket.map(p => 
            <ListItem
              title={p.packInfo.productName}
              subtitle={p.packInfo.name}
              text={`${labels.unitPrice}: ${(p.cost / 1000).toFixed(3)}`}
              footer={`${labels.grossPrice}: ${(parseInt(p.cost * p.returnedQuantity) / 1000).toFixed(3)}`}
              key={i++}
            >
              <div className="list-subtext1">{`${labels.purchased}: ${quantityText(p.purchasedQuantity)} ${p.weightText}`}</div>
              <div className="list-subtext2">{`${labels.returned}: ${quantityText(p.returnedQuantity)}`}</div>
              <Stepper
                slot="after"
                fill
                buttonsOnly
                onStepperPlusClick={() => handleAdd(p)}
                onStepperMinusClick={() => dispatch({type: 'DECREASE_RETURN_QUANTITY', pack: p})}
              />
            </ListItem>
          )}
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
        </List>
      </Block>
      <Fab position="center-bottom" slot="fixed" text={`${labels.submit} ${(totalPrice / 1000).toFixed(3)}`} color="green" onClick={() => handleSubmit()}>
        <Icon material="done"></Icon>
      </Fab>

      <Toolbar bottom>
        <Link href='/home/' iconMaterial="home" />
        <Link href='#' iconMaterial="delete" onClick={() => dispatch({type: 'CLEAR_RETURN_BASKET'})} />
      </Toolbar>
    </Page>
  )
}
export default ReturnBasket
