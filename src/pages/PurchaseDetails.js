import React, { useContext, useState } from 'react'
import { editOrder } from '../data/Actions'
import { Block, Page, Navbar, List, ListItem, Toolbar, ListInput, Button} from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import ReLogin from './ReLogin'
import { StoreContext } from '../data/Store';


const PurchaseDetails = props => {
  const { state, purchases, products, user } = useContext(StoreContext)
  const purchase = purchases.find(rec => rec.id === props.id)

  if (!user) return <ReLogin callingPage="purchase"/>
  return(
    <Page>
      <Navbar title={state.labels.purchaseDetails} backLink="Back" />
      <Block>
          <List>
            {purchase.basket && purchase.basket.map(product => {
              const productInfo = products.find(rec => rec.id === product.id)
              return (
                <ListItem 
                  title={productInfo.name}
                  footer={`${productInfo.size} ${state.units.find(rec => rec.id === productInfo.unit).name}`}
                  after={product.netPrice}
                  key={product.id} 
                />
              )}
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
