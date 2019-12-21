import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Badge} from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import ReLogin from './ReLogin'
import { StoreContext } from '../data/Store';
import { quantityText } from '../data/Actions'


const PurchaseDetails = props => {
  const { state, user } = useContext(StoreContext)
  const purchase = useMemo(() => state.purchases.find(p => p.id === props.id)
  , [state.purchases, props.id])
  if (!user) return <ReLogin />
  return(
    <Page>
      <Navbar title={state.labels.purchaseDetails} backLink={state.labels.back} className="page-title" />
      <Block>
          <List>
            {purchase.basket.map(p => {
              const packInfo = state.packs.find(pa => pa.id === p.packId)
              const productInfo = state.products.find(pr => pr.id === packInfo.productId)
              return (
                <ListItem 
                  title={productInfo.name}
                  footer={packInfo.name}
                  after={(parseInt(p.cost * (p.weight ?? p.quantity)) / 1000).toFixed(3)}
                  key={p.packId} 
                >
                  <Badge slot="title" color="green">{quantityText(p.quantity, p.weight)}</Badge>
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
