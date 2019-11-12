import React, { useContext, useMemo } from 'react'
import { updateOrderStatus, showMessage } from '../data/Actions'
import { Block, Page, Navbar, List, ListItem, Toolbar, Popover, Icon, Badge, Link } from 'framework7-react'
import ReLogin from './ReLogin'
import { StoreContext } from '../data/Store';


const OrderDetails = props => {
  const { state, user } = useContext(StoreContext)
  const order = useMemo(() => state.orders.find(rec => rec.id === props.id), [state.orders])
  const netPrice = useMemo(() => order.total + order.fixedFees + order.deliveryFees - order.discount.value, [order])
  let totalPurchase = 0
  const statusActions = useMemo(() => {
    const statusActions = [
      {id: 'a', title: 'اعتماد', status: ['n', 's', 'f']},
      {id: 'e', title: 'تعديل', status: ['f']},
      {id: 's', title: 'تعليق', status: ['n', 'a']},
      {id: 'u', title: 'رفض', status: ['n', 's']},
      {id: 'c', title: 'الغاء', status: ['n', 'a']},
      {id: 'r', title: 'تسليم', status: ['d', 'b']},
      {id: 'i', title: 'استيداع', status: ['d', 'b']}
    ]
    return statusActions.filter(rec => rec.status.find(status => status === order.status))
  }, [])
  const handleAction = type => {
    if (type === 'e') {
      props.f7router.navigate(`/editOrder/${props.id}`)
    } else {
      const newStatus = order.status === 'f' ? (order.withDelivery ? 'b' : 'd') : type
      updateOrderStatus(
        {...order, 
          status: newStatus, 
          oldStatus: order.status
        }, 
        state.users, 
        state.invitations,
        state.discountTypes
      ).then(() => {
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
            if (order.status === 'f' || order.status === 'd' || order.status === 'b' || order.status === 'r') {
              const storeName = pack.storeId === 'm' ? state.labels.multipleStores : state.stores.find(rec => rec.id === pack.storeId).name
              return (
                <ListItem 
                  key={pack.id} 
                  title={productInfo.name}
                  subtitle={packInfo.name}
                  text={storeName}
                  after={(pack.price * pack.quantity / 1000).toFixed(3)}
                >
                  {pack.quantity > 1 ? <Badge slot="title" color="red">{pack.quantity}</Badge> : ''}
                </ListItem>
              )
            } else {
              return (
                <ListItem 
                  key={pack.id} 
                  title={productInfo.name}
                  footer={packInfo.name}
                  after={(pack.price * pack.quantity / 1000).toFixed(3)}
                >
                  <Badge slot="title" color={pack.purchasedQuantity === pack.quantity ? 'green' : 'red'}>{`${pack.purchasedQuantity} - ${pack.quantity}`}</Badge>
                </ListItem>
              )
            }
          })}
          {order.withDelivery ? <ListItem title={state.labels.delivery}></ListItem> : ''}
          <ListItem title={state.labels.total} after={(order.total / 1000).toFixed(3)} />
          <ListItem title={state.labels.feesTitle} className="red" after={(order.fixedFees / 1000).toFixed(3)} />
          {order.deliveryFees > 0 ? <ListItem title={state.labels.deliveryFees} className="red" after={(order.deliveryFees / 1000).toFixed(3)} /> : ''}
          {order.discount.value > 0 ? <ListItem title={state.discountTypes.find(rec => rec.id === order.discount.type).name} className="discount" after={(order.discount.value / 1000).toFixed(3)} /> : ''}
          <ListItem title={state.labels.net} className="blue" after={(netPrice / 1000).toFixed(3)} />
          {totalPurchase > 0 ? <ListItem title={state.labels.cost} className="blue" after={(totalPurchase / 1000).toFixed(3)} /> : ''}
          {totalPurchase > 0 ? <ListItem title={state.labels.profit} className={netPrice > totalPurchase ? 'green' : 'red'} after={((netPrice - totalPurchase) / 1000).toFixed(3)} /> : ''}
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
