import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Badge} from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import ReLogin from './ReLogin'
import { StoreContext } from '../data/Store';


const StockTransDetails = props => {
  const { state, user } = useContext(StoreContext)
  const stockTrans = useMemo(() => state.stockTrans.find(t => t.id === props.id)
  , [state.stockTrans, props.id])
  if (!user) return <ReLogin callingPage="purchase"/>
  return(
    <Page>
      <Navbar title={state.labels.stockTransDetails} backLink={state.labels.back} />
      <Block>
          <List mediaList>
            {stockTrans.basket && stockTrans.basket.map(p => {
              const packInfo = state.packs.find(pa => pa.id === p.packId)
              const productInfo = state.products.find(pr => pr.id === packInfo.productId)
              return (
                <ListItem 
                  title={productInfo.name}
                  footer={packInfo.name}
                  after={(p.purchasePrice * p.quantity / 1000).toFixed(3)}
                  key={p.packId} 
                >
                  <img slot="media" src={productInfo.imageUrl} className="lazy lazy-fadeIn avatar" alt={productInfo.name} />
                  {p.quantity > 1 ? <Badge slot="title" color="red">{p.quantity}</Badge> : ''}
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
