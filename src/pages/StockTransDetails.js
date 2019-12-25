import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import ReLogin from './ReLogin'
import { StoreContext } from '../data/Store';
import PackImage from './PackImage'
import { quantityText } from '../data/Actions'

const StockTransDetails = props => {
  const { state, user } = useContext(StoreContext)
  const stockTrans = useMemo(() => state.stockTrans.find(t => t.id === props.id)
  , [state.stockTrans, props.id])
  if (!user) return <ReLogin />
  return(
    <Page>
      <Navbar title={`${state.stockTransTypes.find(ty => ty.id === stockTrans.type).name} ${stockTrans.storeId ? state.stores.find(s => s.id === stockTrans.storeId).name : ''}`} backLink={state.labels.back} />
      <Block>
        <List mediaList>
          {stockTrans.basket.map(p => {
            const packInfo = state.packs.find(pa => pa.id === p.packId)
            return (
              <ListItem 
                title={state.products.find(pr => pr.id === packInfo.productId).name}
                subtitle={packInfo.name}
                text={`${state.labels.quantity}: ${quantityText(p.quantity)}`}
                after={(parseInt(p.cost * p.quantity) / 1000).toFixed(3)}
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
