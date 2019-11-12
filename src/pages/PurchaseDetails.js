import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Badge} from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import ReLogin from './ReLogin'
import { StoreContext } from '../data/Store';


const PurchaseDetails = props => {
  const { state, user } = useContext(StoreContext)
  const purchase = useMemo(() => state.purchases.find(rec => rec.id === props.id), [state.purchases])
  if (!user) return <ReLogin callingPage="purchase"/>
  return(
    <Page>
      <Navbar title={state.labels.purchaseDetails} backLink={state.labels.back} />
      <Block>
          <List>
            {purchase.basket && purchase.basket.map(pack => {
              const packInfo = state.packs.find(rec => rec.id === pack.id)
              const productInfo = state.products.find(rec => rec.id === packInfo.productId)
              return (
                <ListItem 
                  title={productInfo.name}
                  footer={packInfo.name}
                  after={(pack.purchasePrice * pack.quantity / 1000).toFixed(3)}
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
export default PurchaseDetails
