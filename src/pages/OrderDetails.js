import React, { useContext, useMemo } from 'react'
import { updateOrder } from '../data/Actions'
import { Block, Page, Navbar, List, ListItem, Toolbar, Popover, Icon, Badge, Link } from 'framework7-react'
import ReLogin from './ReLogin'
import { StoreContext } from '../data/Store';


const OrderDetails = props => {
  const { state, user } = useContext(StoreContext)
  const order = useMemo(() => state.orders.find(order => order.id === props.id), [state.orders])
  const netPrice = useMemo(() => order.total + order.fixedFees + order.deliveryFees - order.discount.value, [order])
  let i = 0
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
    let newStatus
    switch (order.status) {
      case 'f':
        newStatus = order.withDelivery ? 'b' : 'd'
        break;
      default:
        newStatus = type
    }
    if (type === 'e') {
      props.f7router.navigate(`/editOrder/${props.id}`)
    } else {
      updateOrder({...order, status: newStatus}).then(() => {
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
              return (
                pack.stores.map(store => {
                  let storeName = state.stores.find(rec => rec.id === store.storeId).name
                  const storePrice = store.price * store.quantity
                  storeName = store.transId ? `${state.labels.stockName} - ${storeName}` : storeName
                  totalPurchase += storePrice
                  return (
                    <ListItem 
                      key={i++} 
                      title={productInfo.name}
                      subtitle={packInfo.name}
                      text={storeName}
                      after={(pack.price * store.quantity / 1000).toFixed(3)}
                    >
                      <Badge slot="title">
                        {store.quantity}
                      </Badge>
                      {store.price !== pack.price ? 
                        <Badge slot='text' color={storePrice <= pack.price ? 'green' : 'red'}> 
                          {(Math.abs(store.price - pack.price) / 1000).toFixed(3)} 
                        </Badge>
                        : ''
                      }
                    </ListItem>
                  )
                })
              )
            } else {
              return (
                <ListItem 
                  key={pack.id} 
                  title={productInfo.name}
                  footer={packInfo.name}
                  after={(pack.price * pack.quantity / 1000).toFixed(3)}>
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
        <Link href="/home/">
          <Icon material="home" />
        </Link>
        <Link popoverOpen=".popover-menu">
          <Icon material="more_vert" />
        </Link>
      </Toolbar>
    </Page>
  )
}
export default OrderDetails
