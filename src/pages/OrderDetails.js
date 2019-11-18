import React, { useContext, useMemo, useState, useEffect } from 'react'
import { updateOrderStatus, showMessage } from '../data/Actions'
import { Block, Page, Navbar, List, ListItem, Toolbar, Popover, Badge, Link, Toggle } from 'framework7-react'
import ReLogin from './ReLogin'
import { StoreContext } from '../data/Store';


const OrderDetails = props => {
  const { state, user } = useContext(StoreContext)
  const [error, setError] = useState('')
  const order = useMemo(() => state.orders.find(rec => rec.id === props.id), [state.orders, props.id])
  const netPrice = useMemo(() => order.total + order.fixedFees + order.deliveryFees - order.discount.value, [order])
  const netProfit = useMemo(() => order.profit + order.fixedFees + order.deliveryFees - order.discount.value, [order])
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
    return statusActions.filter(rec => rec.status.find(status => status === order.status))
  }, [order.status])
  useEffect(() => {
    if (error) {
      showMessage(props, 'error', error)
      setError('')
    }
  }, [error, props])

  const handleAction = type => {
    if (type === 'e') {
      props.f7router.navigate(`/editOrder/${order.id}`)
    } else {
      updateOrderStatus(order, type, state.packs, state.users, state.invitations, state.discountTypes).then(() => {
        showMessage(props, 'success', state.labels.editSuccess)
        props.f7router.back()
      })  
    }
  }
  if (!user) return <ReLogin callingPage="orders"/>
  return(
    <Page>
      <Navbar title={state.labels.orderDetails} backLink={state.labels.back} />
      <Block>
        <List mediaList>
          {order.basket && order.basket.map(pack => {
            const packInfo = state.packs.find(rec => rec.id === pack.id)
            const productInfo = state.products.find(rec => rec.id === packInfo.productId)
            if (order.status === 'f' || order.status === 'd') {
              const storeName = pack.storeId ? (pack.storeId === 'm' ? state.labels.multipleStores : state.stores.find(rec => rec.id === pack.storeId).name) : ''
              return (
                <ListItem 
                  key={pack.id} 
                  title={productInfo.name}
                  subtitle={packInfo.name}
                  text={storeName}
                  after={((pack.actualPrice ? pack.actualPrice : pack.price) * (pack.quantity - (pack.unavailableQuantity ? pack.unavailableQuantity : 0)) / 1000).toFixed(3)}
                >
                  {pack.quantity > 1 ? <Badge slot="title" color="red">{`${pack.unavailableQuantity ? '(' + pack.unavailableQuantity + ')' : ''} ${pack.purchasedQuantity}`}</Badge> : ''}
                </ListItem>
              )
            } else {
              return (
                <ListItem 
                  key={pack.id} 
                  title={productInfo.name}
                  subtitle={packInfo.name}
                  after={(pack.price * pack.quantity / 1000).toFixed(3)}
                >
                  <Badge slot="title" color={pack.purchasedQuantity === pack.quantity ? 'green' : 'red'}>{`${pack.unavailableQuantity ? '(' + pack.unavailableQuantity + ')' : ''} ${pack.purchasedQuantity} - ${pack.quantity}`}</Badge>
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
                readonly
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
              title={state.discountTypes.find(rec => rec.id === order.discount.type).name} 
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
          {statusActions && statusActions.map(action => 
            <ListItem link="#" key={action.id} popoverClose title={action.title} onClick={() => handleAction(action.id)}/>
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
