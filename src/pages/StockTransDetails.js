import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Badge} from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import ReLogin from './ReLogin'
import { StoreContext } from '../data/Store';


const StockTransDetails = props => {
  const { state, user } = useContext(StoreContext)
  const stockTrans = useMemo(() => state.stockTrans.find(rec => rec.id === props.id), [state.stockTrans, props.id])
  if (!user) return <ReLogin callingPage="purchase"/>
  return(
    <Page>
      <Navbar title={state.labels.stockTransDetails} backLink={state.labels.back} />
      <Block>
          <List mediaList>
            {stockTrans.basket && stockTrans.basket.map(pack => {
              const packInfo = state.packs.find(rec => rec.id === pack.id)
              const productInfo = state.products.find(rec => rec.id === packInfo.productId)
              return (
                <ListItem 
                  title={productInfo.name}
                  footer={packInfo.name}
                  after={(pack.purchasePrice * pack.quantity / 1000).toFixed(3)}
                  key={pack.id} 
                >
                  <img slot="media" src={productInfo.imageUrl} className="lazy lazy-fadeIn avatar" alt={productInfo.name} />
                  {pack.quantity > 1 ? <Badge slot="title" color="red">{pack.quantity}</Badge> : ''}
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
