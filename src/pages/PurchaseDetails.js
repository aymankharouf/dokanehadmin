import React, { useContext } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Badge} from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import ReLogin from './ReLogin'
import { StoreContext } from '../data/Store';


const PurchaseDetails = props => {
  const { state, user } = useContext(StoreContext)
  const purchase = state.purchases.find(rec => rec.id === props.id)

  if (!user) return <ReLogin callingPage="purchase"/>
  return(
    <Page>
      <Navbar title={state.labels.purchaseDetails} backLink="Back" />
      <Block>
          <List>
            {purchase.basket && purchase.basket.map(product => {
              const productInfo = state.products.find(rec => rec.id === product.id)
              return (
                <ListItem 
                  title={productInfo.name}
                  footer={productInfo.description}
                  after={(product.price * product.quantity / 1000).toFixed(3)}
                  key={product.id} 
                >
                  {product.quantity > 1 ? <Badge slot="title" color="red">{product.quantity}</Badge> : null}
                </ListItem>
              )}
            )}
          </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}
export default PurchaseDetails
