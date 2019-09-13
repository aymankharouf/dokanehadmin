import React, { useContext } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Badge} from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import ReLogin from './ReLogin'
import { StoreContext } from '../data/Store';


const StockTransDetails = props => {
  const { state, user } = useContext(StoreContext)
  const stockTrans = state.stockTrans.find(rec => rec.id === props.id)
  if (!user) return <ReLogin callingPage="purchase"/>
  return(
    <Page>
      <Navbar title={state.labels.stockTransDetails} backLink="Back" />
      <Block>
          <List>
            {stockTrans.basket && stockTrans.basket.map(pack => {
              const packInfo = state.packs.find(rec => rec.id === pack.id)
              const productInfo = state.products.find(rec => rec.id === packInfo.productId)
              return (
                <ListItem 
                  title={productInfo.name}
                  footer={packInfo.name}
                  after={(pack.price * pack.quantity / 1000).toFixed(3)}
                  key={pack.id} 
                >
                  {pack.quantity > 1 ? <Badge slot="title" color="red">{pack.quantity}</Badge> : null}
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
