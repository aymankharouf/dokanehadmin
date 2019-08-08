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
            {purchase.basket && purchase.basket.map(product => 
              <ListItem 
                key={product.id} 
                title={`${product.name} (${product.quantity})`} 
                after={product.netPrice}
              />
            )}
            <ListItem title="Total" className="net" after={purchase.total} />
          </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}
export default PurchaseDetails
