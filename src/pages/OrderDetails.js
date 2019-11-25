import React, { useContext, useMemo, useState, useEffect } from 'react'
import { updateOrderStatus, showMessage } from '../data/Actions'
import { Block, Page, Navbar, List, ListItem, Toolbar, Popover, Badge, Link, Toggle } from 'framework7-react'
import ReLogin from './ReLogin'
import { StoreContext } from '../data/Store';


const OrderDetails = props => {
  const { state, user } = useContext(StoreContext)
  const [error, setError] = useState('')
  const order = useMemo(() => state.orders.find(o => o.id === props.id)
  , [state.orders, props.id])
  const netPrice = useMemo(() => order.total + order.fixedFees + order.deliveryFees - order.discount.value
  , [order])
  const netProfit = useMemo(() => order.profit + order.fixedFees + order.deliveryFees - order.discount.value
  , [order])
  const statusActions = useMemo(() => {
    const statusActions = [
      {id: 'a', title: 'اعتماد', status: ['n', 's']},
      {id: 'e', title: 'تعديل', status: ['n', 'a', 'e', 's', 'f']},
      {id: 's', title: 'تعليق', status: ['n', 'a']},
      {id: 'r', title: 'رفض', status: ['n', 's']},
      {id: 'c', title: 'الغاء', status: ['n', 's', 'a']},
      {id: 'd', title: 'تسليم', status: ['f']},
      {id: 'i', title: 'استيداع', status: ['f']}
    ]
    return statusActions.filter(a => a.status.find(s => s === order.status))
  }, [order.status])
  useEffect(() => {
    if (error) {
      showMessage(props, 'error', error)
      setError('')
    }
  }, [error, props])

  const handleAction = type => {
    try{
      if (type === 'e') {
        props.f7router.navigate(`/editOrder/${order.id}`)
      } else {
        if (type === 'a' && !state.customers.find(c => c.id === order.userId)){
          throw new Error(state.labels.notApprovedUser)
        }
        updateOrderStatus(order, type, state.storePacks, state.packs, state.users, state.invitations, state.discountTypes).then(() => {
          showMessage(props, 'success', state.labels.editSuccess)
          props.f7router.back()
        })  
      }  
    } catch (err) {
			err.code ? setError(state.labels[err.code.replace(/-|\//g, '_')]) : setError(err.message)
    }
  }
  if (!user) return <ReLogin callingPage="orders"/>
  return(
    <Page>
      <Navbar title={state.labels.orderDetails} backLink={state.labels.back} />
      <Block>
        <List>
          {order.basket && order.basket.map(p => {
            const packInfo = state.packs.find(pa => pa.id === p.packId)
            const productInfo = state.products.find(pr => pr.id === packInfo.productId)
            if (order.status === 'f' || order.status === 'd') {
              const storeName = p.storeId ? (p.storeId === 'm' ? state.labels.multipleStores : state.stores.find(s => s.id === p.storeId).name) : ''
              return (
                <ListItem 
                  key={p.packId} 
                  title={productInfo.name}
                  subtitle={packInfo.name}
                  text={storeName}
                  after={((p.actualPrice ? p.actualPrice : p.price) * (p.quantity - (p.unavailableQuantity ? p.unavailableQuantity : 0)) / 1000).toFixed(3)}
                >
                  {p.quantity > 1 ? <Badge slot="title" color="red">{`${p.unavailableQuantity ? '(' + p.unavailableQuantity + ')' : ''} ${p.purchasedQuantity}`}</Badge> : ''}
                </ListItem>
              )
            } else {
              return (
                <ListItem 
                  key={p.packId} 
                  title={productInfo.name}
                  subtitle={packInfo.name}
                  after={(p.price * p.quantity / 1000).toFixed(3)}
                >
                  <Badge slot="title" color={p.purchasedQuantity === p.quantity ? 'green' : 'red'}>{`${p.unavailableQuantity ? '(' + p.unavailableQuantity + ')' : ''} ${p.purchasedQuantity} - ${p.quantity}`}</Badge>
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
            after={(order.total / 1000).toFixed(3)} 
          />
          <ListItem 
            title={state.labels.feesTitle} 
            className="red" 
            after={(order.fixedFees / 1000).toFixed(3)} 
          />
          {order.deliveryFees > 0 ? 
            <ListItem 
              title={state.labels.deliveryFees} 
              className="red" 
              after={(order.deliveryFees / 1000).toFixed(3)} 
            /> 
          : ''}
          {order.discount.value > 0 ? 
            <ListItem 
              title={state.discountTypes.find(t => t.id === order.discount.type).name} 
              className="discount" 
              after={(order.discount.value / 1000).toFixed(3)} 
            /> 
          : ''}
          <ListItem 
            title={state.labels.net} 
            className="blue" 
            after={(netPrice / 1000).toFixed(3)} 
          />
          {order.profit ? 
            <ListItem 
              title={state.labels.profit} 
              after={(netProfit / 1000).toFixed(3)} 
            /> 
          : ''}
        </List>
      </Block>
      <Popover className="popover-menu">
        <List>
          {statusActions && statusActions.map(a => 
            <ListItem link="#" key={a.id} popoverClose title={a.title} onClick={() => handleAction(a.id)}/>
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
