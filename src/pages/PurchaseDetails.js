import React, { useContext } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Badge} from 'framework7-react'
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
                  footer={productInfo.description}
                  after={(product.price * product.quantity / 1000).toFixed(3)}
                  key={product.id} 
                >
                  {product.quantity > 1 ? <Badge slot="title" color="red">{product.quantity}</Badge> : null}
                </ListItem>
              )}
            )}
            <ListItem title={state.labels.total} className="net" after={(purchase.total / 1000).toFixed(3)} />
          </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}
export default PurchaseDetails
