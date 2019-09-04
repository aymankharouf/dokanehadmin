import React, { useContext } from 'react'
import { editOrder } from '../data/Actions'
import { Block, Page, Navbar, List, ListItem, Toolbar, Icon, Badge, Link } from 'framework7-react'
import ReLogin from './ReLogin'
import { StoreContext } from '../data/Store';


const EditOrder = props => {
  const { state, products, orders, user } = useContext(StoreContext)
  const order = orders.find(order => order.id === props.id)
  const netPrice = order.total + order.fixedFees + order.deliveryFees - (order.specialDiscount + order.customerDiscount)
  let i = 0
  let totalPurchase = 0
  const handleCancel = (product, store) => {
    editOrder(order, product, store)
  }
  if (!user) return <ReLogin callingPage="orders"/>
  return(
    <Page>
      <Navbar title={state.labels.editOrder} backLink="Back" />
      <Block>
        <List mediaList>
          {order.basket && order.basket.map(product => {
            const productInfo = products.find(rec => rec.id === product.id)
            if (product.stores) {
              return (
                product.stores.map(store => {
                  let storeName = state.stores.find(rec => rec.id === store.storeId).name
                  const storePrice = store.price * store.quantity
                  storeName = store.transId ? `${state.labels.stockName} - ${storeName}` : storeName
                  totalPurchase += storePrice
                  return (
                    <ListItem 
                      link='#'
                      key={i++} 
                      title={productInfo.name}
                      subtitle={productInfo.description}
                      text={storeName}
                      after={(product.price * store.quantity / 1000).toFixed(3)}
                      onClick={() => handleCancel(product, store)}
                    >
                      <Badge slot="title">
                        {store.quantity}
                      </Badge>
                      {storePrice !== product.price ? 
                        <Badge slot='text' color={storePrice <= product.price ? 'green' : 'red'}> 
                          {((storePrice - product.price) / 1000).toFixed(3)} 
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
      <Toolbar bottom>
        <Link href='/home/'>
          <Icon ios='f7:home' aurora='f7:home' md='material:home' />
        </Link>
      </Toolbar>
    </Page>
  )
}
export default React.memo(EditOrder)