import React, { useContext } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon, Badge} from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import ReLogin from './ReLogin'
import { StoreContext } from '../data/Store';
import { confirmPurchase, updateOrder, stockIn, stockOut } from '../data/Actions'


const ConfirmPurchase = props => {
  const { state, user, orders, stockTrans, dispatch } = useContext(StoreContext)
  const store = state.basket.store ? state.stores.find(rec => rec.id === state.basket.store.id) : null
  const total = state.basket.products ? state.basket.products.reduce((a, product) => a + product.netPrice, 0) : 0
  const stock = state.stores.find(rec => rec.storeType === 'i')
  const updateOrders = async (orders, product) => {
    let remainingQuantity = product.quantity
    for (const order of orders) {
      const orderProduct = order.basket.find(rec => rec.id === product.id)
      const otherProducts = order.basket.filter(rec => rec.id !== product.id)
      let purchasedQuantity
      let orderStatus = 'e'
      let orderProductStores = orderProduct.stores ? orderProduct.stores : []
      if (remainingQuantity > 0){
        if (remainingQuantity >= orderProduct.quantity - orderProduct.purchasedQuantity) {
          purchasedQuantity = orderProduct.quantity - orderProduct.purchasedQuantity
          if (otherProducts.length === otherProducts.filter(rec => rec.quantity === rec.purchasedQuantity).length) {
            orderStatus = order.withDelivery ? 'b' : 'f'
          }
        } else {
          purchasedQuantity = orderProduct.quantity - orderProduct.purchasedQuantity - remainingQuantity
        }
        if (state.basket.storeId === stock.id) {
          let productTrans = stockTrans.filter(rec => rec.productId === product.id)
          productTrans.sort((trans1, trans2) => trans1.time.seconds - trans2.time.seconds)
          let remQuantity = purchasedQuantity
          for (const trans of productTrans) {
            if (remQuantity > 0){
              orderProductStores.push({
                storeId: trans.storeId,
                quantity: Math.min(trans.quantity, remQuantity),
                price: trans.purchasePrice
              })
              remQuantity -= Math.min(trans.quantity, remQuantity)
            }
          }
        } else {
          orderProductStores.push({
            storeId: state.basket.storeId,
            quantity: purchasedQuantity,
            price: state.basket.products.find(rec => rec.id === product.id).purchasePrice
          })
        }
        const basket = [
          ...otherProducts, 
          {
            ...orderProduct, 
            purchasedQuantity: orderProduct.purchasedQuantity + purchasedQuantity,
            stores: orderProductStores
          }
        ]
        const newOrder = {
          ...order, 
          basket,
          status: orderStatus
        }
        await updateOrder(newOrder)
        remainingQuantity -=  purchasedQuantity
      }
    }
    return remainingQuantity
  }

  const handlePurchase = async () => {
    if (state.basket.storeId === stock.id) {
      const approvedOrders = orders.filter(rec => rec.status === 'a' || rec.status === 'e')
      for (const product of state.basket.products) {
        let productOrders = approvedOrders.filter(order => order.basket.find(rec => rec.id === product.id && rec.price === product.price))
        productOrders.sort((order1, order2) => order1.time.seconds - order2.time.seconds)
        await updateOrders(productOrders, product)
        await stockOut(product, stock)
      }
    } else { 
      const basket = state.basket.products.map(product => {
        return ({
          id: product.id,
          quantity: product.quantity,
          price: product.price,
          actualPrice: product.actualPrice,
          purchasePrice: product.purchasePrice,
        })
      })
      const purchase = {
        storeId: state.basket.storeId,
        basket,
        total,
        time: new Date()
      }
      confirmPurchase(purchase).then(async () => {
        const approvedOrders = orders.filter(rec => rec.status === 'a' || rec.status === 'e')
        for (const product of state.basket.products) {
          let productOrders = approvedOrders.filter(order => order.basket.find(rec => rec.id === product.id && rec.price === product.price))
          productOrders.sort((order1, order2) => order1.time.seconds - order2.time.seconds)
          const remainingQuantity = await updateOrders(productOrders, product)
          if (remainingQuantity > 0) {
            await stockIn(product, state.basket.storeId, stock, remainingQuantity)
          }
        }
      })
    }
    props.f7router.navigate('/home/')
    dispatch({type: 'CLEAR_BASKET'})
  }
  if (!user) return <ReLogin callingPage="confirmPurchase"/>
  return(
    <Page>
    <Navbar title={`${state.labels.confirmPurchase} ${store ? store.name: ''}`} backLink="Back" />
    <Block>
        <List>
          {state.basket.products && state.basket.products.map(product => 
            <ListItem 
              key={product.id} 
              title={product.name}
              footer={product.description} 
              after={(product.netPrice / 1000).toFixed(3)}
            >
              {product.quantity > 1 ? <Badge slot="title" color="red">{product.quantity}</Badge> : null}
            </ListItem>
          )}
          <ListItem title={state.labels.total} className="total" after={(total / 1000).toFixed(3)} />
        </List>
    </Block>
    <Fab position="center-bottom" slot="fixed" text={state.labels.confirm} color="green" onClick={() => handlePurchase()}>
      <Icon ios="f7:check" aurora="f7:check" md="material:done"></Icon>
    </Fab>
    <Toolbar bottom>
      <BottomToolbar/>
    </Toolbar>
  </Page>
  )
}
export default ConfirmPurchase
