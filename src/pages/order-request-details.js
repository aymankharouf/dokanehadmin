import React, { useContext, useMemo, useState, useEffect } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon } from 'framework7-react'
import { StoreContext } from '../data/store'
import { showMessage, showError, getMessage, quantityDetails, approveOrderRequest } from '../data/actions'
import labels from '../data/labels'
import { orderPackStatus, orderRequestTypes } from '../data/config'
import BottomToolbar from './bottom-toolbar'

const OrderRequestDetails = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const orderRequest = useMemo(() => state.orderRequests.find(r => r.id === props.id)
  , [state.orderRequests, props.id])
  const order = useMemo(() => state.orders.find(o => o.id === orderRequest.order.id)
  , [state.orders, orderRequest])
  const orderBasket = useMemo(() => order.basket.map(p => {
    const packInfo = state.packs.find(pa => pa.id === p.packId)
    const storeName = p.storeId ? (p.storeId === 'm' ? labels.multipleStores : state.stores.find(s => s.id === p.storeId).name) : ''
    const statusNote = `${orderPackStatus.find(s => s.id === p.status).name} ${p.overPriced ? labels.overPricedNote : ''}`
    const newQuantity = orderRequest.basket ? orderRequest.basket.find(bp => bp.packId === p.packId).quantity : ''
    const changeNote = !newQuantity || newQuantity === p.quantity ? '' : newQuantity > p.quantity ? `${labels.increase} ${newQuantity - p.quantity}` : `${labels.decrease} ${p.quantity - newQuantity}`
    return {
      ...p,
      packInfo,
      storeName,
      statusNote,
      changeNote
    }
  }), [order, state.packs, state.stores, orderRequest])
  const urgentDeliveryChange = useMemo(() => {
    let note = ''
    if (order.withDelivery && !orderRequest.order.withDelivery) {
      note = labels.changeDeliveryToOff
    } else if (!order.withDelivery && orderRequest.order.withDelivery) {
      note = labels.changeDeliveryToOn
    }
    if (order.urgent && !orderRequest.order.urgent) {
      note = note ? note + ', ' + labels.changeUrgentToOff : labels.changeUrgentToOff
    } else if (!order.urgent && orderRequest.order.urgent) {
      note = note ? note + ', ' + labels.changeUrgentToOn : labels.changeUrgentToOn
    }
    return note
  }, [order, orderRequest])
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

  const handleApprove = async () => {
    try{
      setInprocess(true)
      await approveOrderRequest(orderRequest, state.orders, state.storePacks, state.packs, state.calls, state.users, state.invitations, state.locations, state.customers)
      setInprocess(false)
      showMessage(labels.approveSuccess)
      props.f7router.back()
    } catch(err) {
      setInprocess(false)
      setError(getMessage(props, err))
    }
  }
  return(
    <Page>
      <Navbar title={`${labels.request} ${orderRequestTypes.find(t => t.id === orderRequest.type).name}`} backLink={labels.back} />
      <Block>
        <List mediaList>
          {urgentDeliveryChange ? 
            <p className="note">{urgentDeliveryChange}</p>
          : ''}
          {orderBasket.map(p => 
            <ListItem 
              key={p.packId} 
              title={p.packInfo.productName}
              subtitle={p.packInfo.name}
              text={quantityDetails(p)}
              footer={`${labels.status}: ${p.statusNote}`}
              after={(p.gross / 1000).toFixed(3)}
            >
              {p.changeNote ? <div className="list-subtext1">{`${labels.requestedChange}: ${p.changeNote}`}</div> : ''}
              <div className="list-subtext2">{p.storeName ? `${labels.storeName}: ${p.storeName}` : ''}</div>
            </ListItem>
          )}
          <ListItem 
            title={labels.total} 
            className="total"
            after={(order.total / 1000).toFixed(3)} 
          />
          <ListItem 
            title={labels.fixedFees} 
            className="fees" 
            after={(order.fixedFees / 1000).toFixed(3)} 
          />
          {order.deliveryFees > 0 ? 
            <ListItem 
              title={labels.deliveryFees}
              className="fees" 
              after={(order.deliveryFees / 1000).toFixed(3)} 
            /> 
          : ''}
          {order.discount > 0 ? 
            <ListItem 
              title={labels.discount} 
              className="discount" 
              after={(order.discount / 1000).toFixed(3)} 
            /> 
          : ''}
          <ListItem 
            title={labels.net} 
            className="net" 
            after={((order.total + order.fixedFees + (order.deliveryFees || 0) - (order.discount || 0)) / 1000).toFixed(3)} 
          />
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleApprove()}>
        <Icon material="done"></Icon>
      </Fab>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}
export default OrderRequestDetails
