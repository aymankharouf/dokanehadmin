import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Link } from 'framework7-react'
import ReLogin from './ReLogin'
import { StoreContext } from '../data/Store';
import { quantityDetails } from '../data/Actions'

const ReturnOrder = props => {
  const { state, user } = useContext(StoreContext)
  const order = useMemo(() => state.orders.find(o => o.id === props.id)
  , [state.orders, props.id])

  if (!user) return <ReLogin />
  return(
    <Page>
      <Navbar title={state.labels.returnOrder} backLink={state.labels.back} />
      <Block>
        <List mediaList>
          {order.basket && order.basket.map(p => {
            const packInfo = state.packs.find(pa => pa.id === p.packId)
            const productInfo = state.products.find(pr => pr.id === packInfo.productId)
            const storeName = p.storeId ? (p.storeId === 'm' ? state.labels.multipleStores : state.stores.find(s => s.id === p.storeId).name) : ''
            const changePriceNote = p.actual && p.actual !== p.price ? `${state.labels.orderPrice}: ${(p.price / 1000).toFixed(3)}` : ''
            const statusNote = `${state.orderPackStatus.find(s => s.id === p.status).name} ${p.overPriced ? state.labels.overPricedNote : ''}`
            return (
              <ListItem 
                link={`/returnOrder/${props.id}/pack/${p.packId}`}
                key={p.packId} 
                title={productInfo.name}
                after={(p.gross / 1000).toFixed(3)}
              >
                <div className="list-line1">{packInfo.name}</div>
                {storeName ? <div className="list-line2">{`${state.labels.storeName}: ${storeName}`}</div> : ''}
                {changePriceNote ? <div className="list-line3">{changePriceNote}</div> : ''}
                <div className="list-line4">{`${state.labels.status}: ${statusNote}`}</div>
                <div className="list-line5">{quantityDetails(p)}</div>
              </ListItem>
            )
          })}
        </List>
      </Block>
      <Toolbar bottom>
        <Link href="/home/" iconMaterial="home" />
        <Link popoverOpen=".popover-menu" iconMaterial="more_vert" />
      </Toolbar>
    </Page>
  )
}
export default ReturnOrder
