import React, { useContext, useMemo, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Popover, Badge, Link, Toggle } from 'framework7-react'
import ReLogin from './ReLogin'
import { StoreContext } from '../data/Store';
import { updateOrderStatus, showMessage, showError, getMessage, quantityText, addQuantity } from '../data/Actions'

const OrderDetails = props => {
  const { state, user } = useContext(StoreContext)
  const [error, setError] = useState('')
  const order = useMemo(() => state.orders.find(o => o.id === props.id)
  , [state.orders, props.id])
  const statusActions = useMemo(() => {
    const statusActions = [
      {id: 'a', title: 'اعتماد', status: ['n', 's'], cancelOrder: false},
      {id: 'e', title: 'تعديل', status: ['n', 'a', 'e', 's', 'f', 'p'], cancelOrder: false},
      {id: 's', title: 'تعليق', status: ['n', 'a'], cancelOrder: false},
      {id: 'r', title: 'رفض', status: ['n', 's'], cancelOrder: false},
      {id: 'c', title: 'الغاء', status: ['n', 's', 'a'], cancelOrder: true},
      {id: 'i', title: 'استيداع', status: ['f', 'e', 'p'], cancelOrder: true},
      {id: 'p', title: 'تجهيز', status: ['f'], cancelOrder: false},
    ]
    return statusActions.filter(a => a.status.find(s => s === order.status) && (props.cancelOrderId ? a.cancelOrder : true))
  }, [order.status, props.cancelOrderId])
  useEffect(() => {
    if (error) {
      showError(props, error)
      setError('')
    }
  }, [error, props])

  const handleAction = async type => {
    try{
      if (type === 'e') {
        props.f7router.navigate(`/editOrder/${order.id}`)
      } else {
        if (type === 'a' && !state.customers.find(c => c.id === order.userId)){
          throw new Error('notApprovedUser')
        }
        await updateOrderStatus(order, type, state.storePacks, state.packs, state.users, state.invitations, props.cancelOrderId)
        showMessage(props, state.labels.editSuccess)
        props.f7router.back()
      }  
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
          {order.basket && order.basket.map(p => {
            const packInfo = state.packs.find(pa => pa.id === p.packId)
            const productInfo = state.products.find(pr => pr.id === packInfo.productId)
            if (['f', 'p', 'd'].includes(order.status)) {
              const storeName = p.storeId ? (p.storeId === 'm' ? state.labels.multipleStores : state.stores.find(s => s.id === p.storeId).name) : ''
              return (
                <ListItem 
                  key={p.packId} 
                  title={productInfo.name}
                  subtitle={packInfo.name}
                  text={storeName}
                  footer={state.orderPackStatus.find(s => s.id === p.status).name}
                  after={(p.gross / 1000).toFixed(3)}
                >
                  {addQuantity(p.purchased, -1 * (p.returned ? p.returned : 0)) > 0 ? <Badge slot="title" color="green">{quantityText(addQuantity(p.purchased, -1 * (p.returned ? p.returned : 0)), addQuantity(p.weight, -1 * (p.returned ? p.returned : 0)))}</Badge> : ''}
                </ListItem>
              )
            } else {
              const remaining = p.status === 'n' || p.status === 'p' ? addQuantity(p.quantity, -1 * p.purchased) : 0
              return (
                <ListItem 
                  key={p.packId} 
                  title={productInfo.name}
                  subtitle={packInfo.name}
                  footer={p.actual && p.actual !== p.price ? `${state.labels.orderPrice}: ${(p.price / 1000).toFixed(3)}` : ''}
                  text={`${remaining > 0 ? state.labels.remain + ': ' + String(remaining) : ''}`}
                  after={(p.gross / 1000).toFixed(3)}
                >
                  <Badge slot="title" color={['f', 'u', 'pu'].includes(p.status) ? 'green' : 'red'}>{quantityText(p.quantity, p.weight)}</Badge>
                </ListItem>
              )
            }
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
          {order.discount.value + order.fraction > 0 ? 
            <ListItem 
              title={state.labels.discount} 
              className="discount" 
              after={((order.discount.value + order.fraction) / 1000).toFixed(3)} 
            /> 
          : ''}
          <ListItem 
            title={state.labels.net} 
            className="net" 
            after={((order.total + order.fixedFees + order.deliveryFees - order.fraction - order.discount.value) / 1000).toFixed(3)} 
          />
          {order.profit ? 
            <ListItem 
              title={state.labels.profitTitle} 
              after={(order.profit / 1000).toFixed(3)} 
            /> 
          : ''}
        </List>
      </Block>
      <Popover className="popover-menu">
        <List>
          <ListItem 
            link={`/customer/${order.userId}/full/1`}
            popoverClose 
            title={state.labels.customerInfo} 
          />
          {statusActions && statusActions.map(a => 
            <ListItem 
              link="#" 
              key={a.id} 
              popoverClose 
              title={a.title} 
              onClick={() => handleAction(a.id)}
            />
          )}
        </List>
      </Popover>
      <Toolbar bottom>
        <Link href="/home/" iconMaterial="home" />
        <Link popoverOpen=".popover-menu" iconMaterial="more_vert" />
      </Toolbar>
    </Page>
  )
}
export default OrderDetails
