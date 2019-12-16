import React, { useContext, useMemo, useEffect, useState } from 'react'
import { Block, Fab, Page, Navbar, List, ListItem, Toolbar, Link, Icon, Stepper, Badge, Toggle } from 'framework7-react'
import { StoreContext } from '../data/Store';
import { updateOrderStatus, editOrder, showMessage, showError, getMessage, quantityText } from '../data/Actions';

const EditOrder = props => {
  const { state, dispatch } = useContext(StoreContext)
  const [error, setError] = useState('')
  const order = useMemo(() => state.orders.find(o => o.id === props.id)
  , [state.orders, props.id])
  const [withDelivery, setWithDelivery] = useState(order.withDelivery)
  const customer = useMemo(() => state.customers.find(c => c.id === order.userId)
  , [state.customers, order])
  const customerLocation = useMemo(() => customer.locationId ? state.locations.find(l => l.id === customer.locationId) : ''
  , [state.locations, customer])
  const orderBasket = useMemo(() => state.orderBasket ? state.orderBasket.filter(p => p.quantity > 0) : []
  , [state.orderBasket])
  const total = useMemo(() => orderBasket.reduce((sum, p) => sum + p.grossPrice, 0)
  , [orderBasket])
  useEffect(() => {
    dispatch({type: 'LOAD_ORDER_BASKET', order})
  }, [dispatch, order])
  useEffect(() => {
    if (error) {
      showError(props, error)
      setError('')
    }
  }, [error, props])

  const handleDelete = () => {
    props.f7router.app.dialog.confirm(state.labels.confirmationText, state.labels.confirmationTitle, async () => {
      try{
        const type = ['f', 'p', 'e'].includes(order.status) ? 'i' : 'c'
        await updateOrderStatus(order, type, state.storePacks, state.packs)
        showMessage(props, state.labels.deleteSuccess)
        dispatch({type: 'CLEAR_ORDER_BASKET'})
        props.f7router.back()
      } catch(err) {
        setError(getMessage(props, err))
      }
    })  
  }
  const handleSubmit = async () => {
    try{
      await editOrder({...order, withDelivery}, state.orderBasket, state.storePacks, state.packs, customer)
      showMessage(props, state.labels.editSuccess)
      dispatch({type: 'CLEAR_ORDER_BASKET'})
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  return (
    <Page>
      <Navbar title={state.labels.editOrder} backLink={state.labels.back} />
      <Block>
        <List mediaList>
          {orderBasket && orderBasket.map(p => {
            const packInfo = state.packs.find(pa => pa.id === p.packId)
            const productInfo = state.products.find(pr => pr.id === packInfo.productId)
            return (
              <ListItem
                title={productInfo.name}
                subtitle={packInfo.name}
                footer={`${state.labels.price}: ${(p.grossPrice / 1000).toFixed(3)}`}
                text={quantityText(p.quantity)}
                key={p.packId}
              >
                <img slot="media" src={productInfo.imageUrl} className="img-list" alt={productInfo.name} />
                <Badge slot="title" color={p.purchasedQuantity === p.quantity ? 'green' : 'red'}>{`${p.purchasedQuantity} - ${p.quantity}`}</Badge>
                <Stepper
                  slot="after"
                  fill
                  buttonsOnly
                  onStepperPlusClick={() => dispatch({type: 'INCREASE_ORDER_QUANTITY', pack: p})}
                  onStepperMinusClick={() => dispatch({type: 'DECREASE_ORDER_QUANTITY', pack: p})}
                />
              </ListItem>
            )
          })}
        </List>
        <List>
          <ListItem>
            <span>{state.labels.withDelivery}</span>
            <Toggle 
              name="withDelivery" 
              color="green" 
              checked={withDelivery} 
              onToggleChange={() => setWithDelivery(!withDelivery)}
              disabled={customerLocation ? !customerLocation.hasDelivery : false}
            />
          </ListItem>
        </List>
      </Block>
      <Fab position="center-bottom" slot="fixed" text={`${state.labels.submit} ${(total / 1000).toFixed(3)}`} color="green" onClick={() => handleSubmit()}>
        <Icon material="done"></Icon>
      </Fab>

      <Toolbar bottom>
        <Link href='/home/' iconMaterial="home" />
        <Link href='#' iconMaterial="delete" onClick={() => handleDelete()} />
      </Toolbar>
    </Page>
  )
}
export default EditOrder
