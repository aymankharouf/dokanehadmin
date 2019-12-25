import React, { useContext, useMemo, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Popover, Link, Toggle } from 'framework7-react'
import ReLogin from './ReLogin'
import { StoreContext } from '../data/Store';
import { updateOrderStatus, showMessage, showError, getMessage, quantityDetails, sendOrder, returnOrder } from '../data/Actions'

const FollowupOrderDetails = props => {
  const { state, user } = useContext(StoreContext)
  const [error, setError] = useState('')
  const order = useMemo(() => state.orders.find(o => o.id === props.id)
  , [state.orders, props.id])
  const netPrice = useMemo(() => {
    const net = order.total + order.fixedFees + order.deliveryFees - order.discount.value
    return Math.floor(net / 50) * 50
  }, [order])
  useEffect(() => {
    if (error) {
      showError(props, error)
      setError('')
    }
  }, [error, props])

  const handleSend = async () => {
    try{
      if (order.position !== 's' && order.status === 'd') {
        props.f7router.app.dialog.confirm(state.labels.confirmeReceiveText, state.labels.confirmationTitle, async () => {
          try{
            await sendOrder(order, order.position === 's' ? (order.withDelivery ? 'd' : 'c') : 's')
            showMessage(props, state.labels.sendSuccess)
            props.f7router.back()
          } catch(err) {
            setError(getMessage(props, err))
          }
        })  
      } else {
        await sendOrder(order, order.position === 's' ? (order.withDelivery ? 'd' : 'c') : 's')
        showMessage(props, state.labels.sendSuccess)
        props.f7router.back()
      }
    } catch(err) {
      setError(getMessage(props, err))
    }
  }
  const handleDelivery = async () => {
    try{
      await updateOrderStatus(order, 'd', state.storePacks, state.packs, state.users, state.invitations, props.cancelOrderId)
      showMessage(props, state.labels.editSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  const handleReturn = async () => {
    try {
      await returnOrder(order, state.storePacks, state.packs)
      showMessage(props, state.labels.editSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  if (!user) return <ReLogin />
  return(
    <Page>
      <Navbar title={state.labels.orderDetails} backLink={state.labels.back} />
      <Block>
        <List mediaList>
          {order.basket.map(p => {
            const packInfo = state.packs.find(pa => pa.id === p.packId)
            const productInfo = state.products.find(pr => pr.id === packInfo.productId)
            const storeName = p.storeId ? (p.storeId === 'm' ? state.labels.multipleStores : state.stores.find(s => s.id === p.storeId).name) : ''
            const changePriceNote = p.actual && p.actual !== p.price ? `${state.labels.orderPrice}: ${(p.price / 1000).toFixed(3)}` : ''
            const statusNote = `${state.orderPackStatus.find(s => s.id === p.status).name} ${p.overPriced ? state.labels.overPricedNote : ''}`
            return (
              <ListItem 
                key={p.packId} 
                title={productInfo.name}
                subtitle={packInfo.name}
                text={storeName ? `${state.labels.storeName}: ${storeName}` : ''}
                footer={quantityDetails(p)}
                after={(p.gross / 1000).toFixed(3)}
              >
                {changePriceNote ? <div className="list-subtext1">{changePriceNote}</div> : ''}
                <div className="list-subtext2">{`${state.labels.status}: ${statusNote}`}</div>
              </ListItem>
            )
          })}
          {order.withDelivery ? 
            <ListItem>
              <span>{state.labels.withDelivery}</span>
              <Toggle 
                name="withDelivery" 
                color="green" 
                checked={order.withDelivery} 
                disabled
              />
            </ListItem> 
          : ''}
          <ListItem 
            title={state.labels.total} 
            className="total"
            after={(order.total / 1000).toFixed(3)} 
          />
          <ListItem 
            title={state.labels.fixedFeesTitle} 
            className="fees" 
            after={(order.fixedFees / 1000).toFixed(3)} 
          />
          {order.deliveryFees > 0 ? 
            <ListItem 
              title={state.labels.deliveryFees} 
              className="fees" 
              after={(order.deliveryFees / 1000).toFixed(3)} 
            /> 
          : ''}
          {order.discount.value > 0 ? 
            <ListItem 
              title={state.labels.discount} 
              className="discount" 
              after={(order.discount.value / 1000).toFixed(3)} 
            /> 
          : ''}
          <ListItem 
            title={state.labels.net} 
            className="net" 
            after={(netPrice / 1000).toFixed(3)} 
          />
        </List>
      </Block>
      <Popover className="popover-menu">
        <List>
          <ListItem 
            link={`/customerDetails/${order.userId}/full/0`}
            popoverClose 
            title={state.labels.customerInfo} 
          />
          <ListItem 
            link={`/returnOrder/${order.id}`}
            popoverClose 
            title={state.labels.return} 
          />
          {order.position === 's' && (order.total === 0 || order.status === 'd') ? '' :
            <ListItem 
              link="#"
              popoverClose 
              title={order.position === 's' ? (order.withDelivery ? state.labels.toCar : state.labels.toCenter) : order.status === 'd' ? state.labels.receiveOrderAmount : state.labels.toStore} 
              onClick={() => handleSend()}
            />
          }
          {order.total === 0 || order.status === 'd' ? '' :
            <ListItem 
              link="#"
              popoverClose 
              title={state.labels.receive} 
              onClick={() => handleDelivery()}
            />
          }
          {order.position === 's' && order.basket.find(p => p.returned > 0) ? 
            <ListItem 
              link="#"
              popoverClose 
              title={state.labels.toStock} 
              onClick={() => handleReturn()}
            />
          : ''}
        </List>
      </Popover>
      <Toolbar bottom>
        <Link href="/home/" iconMaterial="home" />
        <Link popoverOpen=".popover-menu" iconMaterial="more_vert" />
      </Toolbar>
    </Page>
  )
}
export default FollowupOrderDetails
