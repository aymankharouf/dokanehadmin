import React, { useContext, useMemo, useEffect, useState } from 'react'
import { f7, Block, Fab, Page, Navbar, List, ListItem, Toolbar, Link, Icon, Stepper, Toggle } from 'framework7-react'
import { StoreContext } from '../data/store'
import { updateOrderStatus, editOrder, showMessage, showError, getMessage, quantityDetails } from '../data/actions'
import PackImage from './pack-image'
import labels from '../data/labels'

const EditPurchase = props => {
  const { state, dispatch } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const purchase = useMemo(() => state.purchases.find(o => o.id === props.id)
  , [state.purchases, props.id])
  const [discount, setDiscount] = useState(purchase.discount)
  const store = useMemo(() => state.stores.find(s => s.id === purchase.storeId)
  , [state.stores, purchase])
  const purchaseBasket = useMemo(() => {
    let purchaseBasket = state.purchaseBasket ? state.purchaseBasket.filter(p => p.quantity > 0) : []
    purchaseBasket = purchaseBasket.map(p => {
      const packInfo = state.packs.find(pa => pa.id === p.packId)
      return {
        ...p,
        packInfo
      }
    })
    return purchaseBasket
  }, [state.purchaseBasket, state.packs])
  const total = useMemo(() => purchaseBasket.reduce((sum, p) => sum + p.gross, 0)
  , [purchaseBasket])
  useEffect(() => {
    dispatch({type: 'LOAD_PURCHASE_BASKET', purchase})
  }, [dispatch, purchase])
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

  const handleDelete = () => {
    f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, async () => {
      try{
        const type = ['f', 'p', 'e'].includes(order.status) ? 'i' : 'c'
        setInprocess(true)
        await updateOrderStatus(order, type, state.storePacks, state.packs, state.calls)
        setInprocess(false)
        showMessage(labels.deleteSuccess)
        dispatch({type: 'CLEAR_ORDER_BASKET'})
        props.f7router.back()
      } catch(err) {
        setInprocess(false)
        setError(getMessage(props, err))
      }
    })  
  }
  const handleSubmit = async () => {
    try{
      setInprocess(true)
      await editOrder({...order, withDelivery, urgent}, state.orderBasket, state.storePacks, state.packs, state.locations, state.customers.find(c => c.id === order.userId))
      setInprocess(false)
      showMessage(labels.editSuccess)
      dispatch({type: 'CLEAR_ORDER_BASKET'})
      props.f7router.back()
    } catch(err) {
      setInprocess(false)
			setError(getMessage(props, err))
		}
  }
  return (
    <Page>
      <Navbar title={labels.editPurchase} backLink={labels.back} />
      <Block>
        <List mediaList>
          {purchaseBasket.map(p =>
            <ListItem
              title={p.packInfo.productName}
              subtitle={p.packInfo.name}
              text={`${labels.unitPrice}: ${(p.price / 1000).toFixed(3)}`}
              footer={quantityDetails(p)}
              key={p.packId}
            >
              <PackImage slot="media" pack={p.packInfo} type="list" />
              <div className="list-subtext1">{`${labels.grossPrice}: ${(p.gross / 1000).toFixed(3)}`}</div>
              <Stepper
                slot="after"
                fill
                buttonsOnly
                onStepperPlusClick={() => dispatch({type: 'INCREASE_PURCHASE_QUANTITY', pack: p})}
                onStepperMinusClick={() => dispatch({type: 'DECREASE_PURCHASE_QUANTITY', pack: p})}
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
      <Fab position="center-bottom" slot="fixed" text={`${labels.submit} ${(total / 1000).toFixed(3)}`} color="green" onClick={() => handleSubmit()}>
        <Icon material="done"></Icon>
      </Fab>

      <Toolbar bottom>
        <Link href='/home/' iconMaterial="home" />
        <Link href='#' iconMaterial="delete" onClick={() => handleDelete()} />
      </Toolbar>
    </Page>
  )
}
export default EditPurchase
