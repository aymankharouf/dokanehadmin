import React, { useContext, useState } from 'react'
import { editOrder } from '../data/Actions'
import { Block, Page, Navbar, List, ListItem, Toolbar, ListInput, Button} from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import ReLogin from './ReLogin'
import { StoreContext } from '../data/Store';


const PurchaseDetails = props => {
  const { state, user } = useContext(StoreContext)
  const purchase = state.purchases.find(rec => rec.id === props.id)

  if (!user) return <ReLogin callingPage="purchase"/>
  return(
    <Page>
      <Navbar title="Purchase Detail" backLink="Back" />
      <Block>
          <List>
            {purchase.basket && purchase.basket.map(product => {
              return (
                <ListItem key={product.id} title={product.name} after={product.netPrice}></ListItem>
              )
            })}
            <ListItem title="Total" className="total" after={parseFloat(purchase.total - 0.250).toFixed(3)}></ListItem>
            <ListItem title="Delivery" className="delivery" after="0.250"></ListItem>
            <ListItem title="Net Total" className="net" after={purchase.total}></ListItem>
          </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}
export default PurchaseDetails
