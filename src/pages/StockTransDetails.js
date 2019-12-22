import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import ReLogin from './ReLogin'
import { StoreContext } from '../data/Store';
import PackImage from './PackImage'

const StockTransDetails = props => {
  const { state, user } = useContext(StoreContext)
  const stockTrans = useMemo(() => state.stockTrans.find(t => t.id === props.id)
  , [state.stockTrans, props.id])
  if (!user) return <ReLogin />
  return(
    <Page>
      <Navbar title={state.labels.stockTransDetails} backLink={state.labels.back} />
      <Block>
        <List mediaList>
          {stockTrans.basket.map(p => {
            const packInfo = state.packs.find(pa => pa.id === p.packId)
            return (
              <ListItem 
                title={state.products.find(pr => pr.id === packInfo.productId).name}
                subtitle={packInfo.name}
                after={(parseInt(p.cost * p.quantity) / 1000).toFixed(3)}
                badge={p.quantity}
                badgeColor="red"
                key={p.packId}
              >
                <PackImage slot="media" pack={packInfo} type="list" />
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
