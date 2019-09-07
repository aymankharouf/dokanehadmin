import React, { useContext } from 'react'
import { updateOrder } from '../data/Actions'
import { Block, Page, Navbar, List, ListItem, Toolbar, Popover, Icon, Badge, Link } from 'framework7-react'
import ReLogin from './ReLogin'
import { StoreContext } from '../data/Store';


const OrderDetails = props => {
  const { state, user } = useContext(StoreContext)
  const order = state.orders.find(order => order.id === props.id)
  const netPrice = order.total + order.fixedFees + order.deliveryFees - (order.specialDiscount + order.customerDiscount)
  let i = 0
  let totalPurchase = 0
  let statusActions = [
    {id: 'a', title: 'اعتماد', status: ['n', 's', 'f']},
    {id: 'e', title: 'تعديل', status: ['f']},
    {id: 's', title: 'تعليق', status: ['n', 'a']},
    {id: 'u', title: 'رفض', status: ['n', 's']},
    {id: 'c', title: 'الغاء', status: ['n', 'a']},
    {id: 'r', title: 'تسليم', status: ['d', 'b']},
    {id: 'i', title: 'استيداع', status: ['d', 'b']}
  ]
  statusActions = statusActions.filter(rec => rec.status.find(status => status === order.status))
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
      <Navbar title={state.labels.orderDetails} backLink="Back" />
      <Block>
        <List mediaList>
          {order.basket && order.basket.map(product => {
            const productInfo = state.products.find(rec => rec.id === product.id)
            if (order.status === 'f' || order.status === 'd' || order.status === 'b' || order.status === 'r') {
              return (
                product.stores.map(store => {
                  let storeName = state.stores.find(rec => rec.id === store.storeId).name
                  const storePrice = store.price * store.quantity
                  storeName = store.transId ? `${state.labels.stockName} - ${storeName}` : storeName
                  totalPurchase += storePrice
                  return (
                    <ListItem 
                      key={i++} 
                      title={productInfo.name}
                      subtitle={productInfo.description}
                      text={storeName}
                      after={(product.price * store.quantity / 1000).toFixed(3)}
                    >
                      <Badge slot="title">
                        {store.quantity}
                      </Badge>
                      {store.price !== product.price ? 
                        <Badge slot='text' color={storePrice <= product.price ? 'green' : 'red'}> 
                          {((store.price - product.price) / 1000).toFixed(3)} 
                        </Badge>
                        : null
                      }
                    </ListItem>
                  )
                })
              )
            } else {
              return (
                <ListItem 
                  key={product.id} 
                  title={productInfo.name}
                  footer={productInfo.description}
                  after={(product.price * product.quantity / 1000).toFixed(3)}>
                  <Badge slot="title" color={product.purchasedQuantity === product.quantity ? 'green' : 'red'}>{`${product.purchasedQuantity} - ${product.quantity}`}</Badge>
                </ListItem>
              )
            }
          })}
          {order.withDelivery ? <ListItem title={state.labels.delivery}></ListItem> : null}
          <ListItem title={state.labels.total} after={(order.total / 1000).toFixed(3)} />
          <ListItem title={state.labels.feesTitle} className="red" after={(order.fixedFees / 1000).toFixed(3)} />
          {order.deliveryFees > 0 ? <ListItem title={state.labels.deliveryFees} className="red" after={(order.deliveryFees / 1000).toFixed(3)} /> : null}
          {order.specialDiscount + order.customerDiscount > 0 ? <ListItem title={state.labels.discount} className="discount" after={((order.specialDiscount + order.customerDiscount) / 1000).toFixed(3)} /> : null}
          <ListItem title={state.labels.net} className="blue" after={(netPrice / 1000).toFixed(3)} />
          {totalPurchase > 0 ? <ListItem title={state.labels.cost} className="blue" after={(totalPurchase / 1000).toFixed(3)} /> : null}
          {totalPurchase > 0 ? <ListItem title={state.labels.profit} className={netPrice > totalPurchase ? 'green' : 'red'} after={((netPrice - totalPurchase) / 1000).toFixed(3)} /> : null}
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
        <Link href='/home/'>
          <Icon ios='f7:home' aurora='f7:home' md='material:home' />
        </Link>
        <Link popoverOpen=".popover-menu">
          <Icon ios='f7:more_vertical_fill' aurora='f7:more_vertical_fill' md='material:more_vert' />
        </Link>
      </Toolbar>
    </Page>
  )
}
export default React.memo(OrderDetails)
