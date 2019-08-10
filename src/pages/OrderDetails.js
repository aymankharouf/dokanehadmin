import React, { useContext, useState } from 'react'
import { updateOrder } from '../data/Actions'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, FabButtons, FabButton, Icon, Badge } from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import ReLogin from './ReLogin'
import { StoreContext } from '../data/Store';


const OrderDetails = props => {
  const { state, products, orders, user } = useContext(StoreContext)
  const order = orders.find(order => order.id === props.id)
  const handleApprove = () => {
    updateOrder({...order, status: 'a'}).then(() => {
      props.f7router.back()
    })
  }

  if (!user) return <ReLogin callingPage="order"/>
  return(
    <Page>
      <Navbar title={state.labels.orderDetails} backLink="Back" />
      <Block>
          <List>
            {order.basket && order.basket.map(product => {
              const productInfo = products.find(rec => rec.id === product.id)
              return (
                <ListItem 
                  key={product.id} 
                  title={productInfo.name}
                  footer={`${productInfo.size} ${state.units.find(rec => rec.id === productInfo.unit).name}`}
                  after={parseFloat(product.price * product.quantity).toFixed(3)}>
                  <Badge slot="title" color={product.purchasedQuantity === product.quantity ? 'green' : 'red'}>{`${product.purchasedQuantity} - ${product.quantity}`}</Badge>
                </ListItem>
              )}
            )}
            <ListItem title="Total" className="total" after={parseFloat(order.total - 0.250).toFixed(3)} />
          </List>
      </Block>
      <Fab position="right-bottom" slot="fixed" color="orange">
        <Icon ios="f7:chevron_up" aurora="f7:chevron_up" md="material:keyboard_arrow_up"></Icon>
        <Icon ios="f7:close" aurora="f7:close" md="material:close"></Icon>
        <FabButtons position="top">
          <FabButton color="green" onClick={() => handleApprove()}>
            <Icon ios="f7:check" aurora="f7:check" md="material:done"></Icon>
          </FabButton>
        </FabButtons>
      </Fab>

      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}
export default OrderDetails
