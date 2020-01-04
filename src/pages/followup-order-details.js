import React, { useContext, useMemo, useState, useEffect } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, Toggle, Fab, Icon, Actions, ActionsButton } from 'framework7-react'
import ReLogin from './relogin'
import { StoreContext } from '../data/store'
import { updateOrderStatus, showMessage, showError, getMessage, quantityDetails, sendOrder, returnOrder } from '../data/actions'
import labels from '../data/labels'
import { orderPackStatus } from '../data/config'
import BottomToolbar from './bottom-toolbar'

const FollowupOrderDetails = props => {
  const { state, user } = useContext(StoreContext)
  const [error, setError] = useState('')
  const order = useMemo(() => state.orders.find(o => o.id === props.id)
  , [state.orders, props.id])
  const orderBasket = useMemo(() => order.basket.map(p => {
    const packInfo = state.packs.find(pa => pa.id === p.packId)
    const productInfo = state.products.find(pr => pr.id === packInfo.productId)
    const storeName = p.storeId ? (p.storeId === 'm' ? labels.multipleStores : state.stores.find(s => s.id === p.storeId).name) : ''
    const changePriceNote = p.actual && p.actual !== p.price ? `${labels.orderPrice}: ${(p.price / 1000).toFixed(3)}, ${labels.currentPrice}: ${(p.actual / 1000).toFixed(3)}` : ''
    const statusNote = `${orderPackStatus.find(s => s.id === p.status).name} ${p.overPriced ? labels.overPricedNote : ''}`
    return {
      ...p,
      packInfo,
      productInfo,
      storeName,
      changePriceNote,
      statusNote
    }
  }), [order, state.packs, state.products, state.stores])
  const fractionFromProfit = useMemo(() => {
    let fraction = 0
    if (order.fixedFees === 0) {
      const profit = order.basket.reduce((sum, p) => sum + ['p', 'f', 'pu'].includes(p.status) ? parseInt((p.actual - p.cost) * (p.weight || p.purchased)) : 0, 0)
      fraction = profit - order.profit
    }
    return fraction
  }, [order])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])

  const handleSend = async () => {
    try{
      if (order.position !== 's' && order.status === 'd') {
        f7.dialog.confirm(labels.confirmeReceiveText, labels.confirmationTitle, async () => {
          try{
            await sendOrder(order, order.position === 's' ? (order.withDelivery ? 'd' : 'c') : 's')
            showMessage(labels.sendSuccess)
            props.f7router.back()
          } catch(err) {
            setError(getMessage(props, err))
          }
        })  
      } else {
        await sendOrder(order, order.position === 's' ? (order.withDelivery ? 'd' : 'c') : 's')
        showMessage(labels.sendSuccess)
        props.f7router.back()
      }
    } catch(err) {
      setError(getMessage(props, err))
    }
  }
  const handleDelivery = async () => {
    try{
      await updateOrderStatus(order, 'd', state.storePacks, state.packs, state.users, state.invitations, props.cancelOrderId)
      showMessage(labels.editSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  const handleReturn = async () => {
    try {
      await returnOrder(order, state.storePacks, state.packs)
      showMessage(labels.editSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  if (!user) return <ReLogin />
  return(
    <Page>
      <Navbar title={labels.orderDetails} backLink={labels.back} />
      <Block>
        <List mediaList>
          {orderBasket.map(p => 
            <ListItem 
              key={p.packId} 
              title={p.productInfo.name}
              subtitle={p.packInfo.name}
              text={p.storeName ? `${labels.storeName}: ${p.storeName}` : ''}
              footer={quantityDetails(p)}
              after={(p.gross / 1000).toFixed(3)}
            >
              {p.changePriceNote ? <div className="list-subtext1">{p.changePriceNote}</div> : ''}
              <div className="list-subtext2">{`${labels.status}: ${p.statusNote}`}</div>
            </ListItem>
          )}
          {order.withDelivery ? 
            <ListItem>
              <span>{labels.withDelivery}</span>
              <Toggle 
                name="withDelivery" 
                color="green" 
                checked={order.withDelivery} 
                disabled
              />
            </ListItem> 
          : ''}
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
            after={((order.total + order.fixedFees + (order.deliveryFees || 0) - (order.discount || 0) - fractionFromProfit) / 1000).toFixed(3)} 
          />
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => f7.actions.open('#actions')}>
        <Icon material="build"></Icon>
      </Fab>
      <Actions id="actions">
        <ActionsButton onClick={() => props.f7router.navigate(`/customer-details/${order.userId}/full/0`)}>{labels.customerInfo}</ActionsButton>
        <ActionsButton onClick={() => props.f7router.navigate(`/return-order/${order.id}`)}>{labels.returnPacks}</ActionsButton>
        {order.position === 's' && (order.total === 0 || order.status === 'd') ? '' :
          <ActionsButton onClick={() => handleSend()}>
            {order.position === 's' ? (order.withDelivery ? labels.toCar : labels.toCenter) : order.status === 'd' ? labels.receiveOrderAmount : labels.toStore}
          </ActionsButton>
        }
        {order.total === 0 || order.status === 'd' ? '' :
          <ActionsButton onClick={() => handleDelivery()}>{labels.deliver}</ActionsButton>
        }
        {order.position === 's' && order.basket.find(p => p.returned > 0) ? 
          <ActionsButton onClick={() => handleReturn()}>{labels.toStock}</ActionsButton>
        : ''}
      </Actions>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}
export default FollowupOrderDetails
