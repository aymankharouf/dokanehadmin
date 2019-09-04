import React, { useContext } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Badge} from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import ReLogin from './ReLogin'
import { StoreContext } from '../data/Store';


const StockTransDetails = props => {
  const { state, stockTrans, products, user } = useContext(StoreContext)
  const trans = stockTrans.find(rec => rec.id === props.id)
  if (!user) return <ReLogin callingPage="purchase"/>
  return(
    <Page>
      <Navbar title={state.labels.stockTransDetails} backLink="Back" />
      <Block>
          <List>
            {trans.basket && trans.basket.map(product => {
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
          </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}
export default StockTransDetails
