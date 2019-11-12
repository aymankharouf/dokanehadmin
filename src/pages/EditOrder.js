import React, { useContext, useMemo } from 'react'
import { editOrder } from '../data/Actions'
import { Block, Page, Navbar, List, ListItem, Toolbar, Icon, Badge, Link } from 'framework7-react'
import ReLogin from './ReLogin'
import { StoreContext } from '../data/Store';


const EditOrder = props => {
  const { state, user } = useContext(StoreContext)
  const order = useMemo(() => state.orders.find(order => order.id === props.id), [state.orders])
  const netPrice = useMemo(() => order.total + order.fixedFees + order.deliveryFees - (order.specialDiscount + order.customerDiscount), [order])
  let i = 0
  let totalPurchase = 0
  const handleCancel = (pack, store) => {
    editOrder(order, pack, store)
  }
  if (!user) return <ReLogin callingPage="orders"/>
  return(
    <Page>
      <Navbar title={state.labels.editOrder} backLink={state.labels.back} />
      <Block>
        <List mediaList>
          {order.basket && order.basket.map(pack => {
            const packInfo = state.packs.find(rec => rec.id === pack.id)
            const productInfo = state.products.find(rec => rec.id === packInfo.productId)
            return (
              <ListItem 
                key={pack.id} 
                title={productInfo.name}
                footer={pack.name}
                after={(pack.price * pack.quantity / 1000).toFixed(3)}>
                <Badge slot="title" color={pack.purchasedQuantity === pack.quantity ? 'green' : 'red'}>{`${pack.purchasedQuantity} - ${pack.quantity}`}</Badge>
              </ListItem>
            )
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
        <Link href="/home/" iconMaterial="home" />
      </Toolbar>
    </Page>
  )
}
export default EditOrder
