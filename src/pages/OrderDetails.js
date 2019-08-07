import React, { useContext, useState } from 'react'
import { updateOrder } from '../data/Actions'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, FabButtons, FabButton, Icon } from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import ReLogin from './ReLogin'
import { StoreContext } from '../data/Store';


const OrderDetails = props => {
  const { orders, user } = useContext(StoreContext)
  const order = orders.find(order => order.id === props.id)
  const handleApprove = () => {
    updateOrder({...order, status: 'a'}).then(() => {
      props.f7router.back()
    })
  }

  if (!user) return <ReLogin callingPage="order"/>
  return(
    <Page>
      <Navbar title="Order" backLink="Back" />
      <Block>
          <List>
            {order.basket && order.basket.map(product => 
              <ListItem 
                key={product.id} 
                title={`${product.name} (${product.quantity})`} 
                after={parseFloat(product.netPrice).toFixed(3)}
              ></ListItem>
            )}
            <ListItem title="Total" className="total" after={parseFloat(order.total - 0.250).toFixed(3)}></ListItem>
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
