import React, { useContext, useState, useEffect } from 'react'
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
  const [order] = useState(() => state.orders.find(o => o.id === props.id))
  const [orderBasket, setOrderBasket] = useState([])
  useEffect(() => {
    setOrderBasket(() => order.basket.map(p => {
      const storeName = p.storeId ? (p.storeId === 'm' ? labels.multipleStores : state.stores.find(s => s.id === p.storeId).name) : ''
      const statusNote = `${orderPackStatus.find(s => s.id === p.status).name} ${p.overPriced ? labels.overPricedNote : ''}`
      const newQuantity = order.requestBasket ? order.requestBasket.find(bp => bp.packId === p.packId).quantity : ''
      const changeNote = !newQuantity || newQuantity === p.quantity ? '' : newQuantity > p.quantity ? `${labels.increase} ${newQuantity - p.quantity}` : `${labels.decrease} ${p.quantity - newQuantity}`
      return {
        ...p,
        storeName,
        statusNote,
        changeNote
      }
    }))
  }, [order, state.stores])
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
      await approveOrderRequest(order, state.orders, state.packPrices, state.packs)
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
      <Navbar title={`${labels.request} ${orderRequestTypes.find(t => t.id === order.requestType).name}`} backLink={labels.back} />
      <Block>
        <List mediaList>
          {orderBasket.map(p => 
            <ListItem 
              key={p.packId} 
              title={p.productName}
              subtitle={p.packName}
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
            after={((order.fixedFees + order.deliveryFees) / 1000).toFixed(3)} 
          />
          <ListItem 
            title={labels.discount} 
            className="discount" 
            after={((order.discount.value + order.fraction) / 1000).toFixed(3)} 
          /> 
          <ListItem 
            title={labels.net} 
            className="net" 
            after={((order.total + order.fixedFees + order.deliveryFees - order.discount.value - order.fraction) / 1000).toFixed(3)} 
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
