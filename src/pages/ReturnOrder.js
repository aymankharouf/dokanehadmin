import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Link } from 'framework7-react'
import ReLogin from './ReLogin'
import { StoreContext } from '../data/store'
import { quantityDetails } from '../data/actions'
import labels from '../data/labels'

const ReturnOrder = props => {
  const { state, user } = useContext(StoreContext)
  const order = useMemo(() => state.orders.find(o => o.id === props.id)
  , [state.orders, props.id])

  if (!user) return <ReLogin />
  return(
    <Page>
      <Navbar title={labels.returnOrder} backLink={labels.back} />
      <Block>
        <List mediaList>
          {order.basket.map(p => {
            const packInfo = state.packs.find(pa => pa.id === p.packId)
            const productInfo = state.products.find(pr => pr.id === packInfo.productId)
            const storeName = p.storeId ? (p.storeId === 'm' ? labels.multipleStores : state.stores.find(s => s.id === p.storeId).name) : ''
            const changePriceNote = p.actual && p.actual !== p.price ? `${labels.orderPrice}: ${(p.price / 1000).toFixed(3)}, ${labels.currentPrice}: ${(p.actual / 1000).toFixed(3)}` : ''
            const statusNote = `${state.orderPackStatus.find(s => s.id === p.status).name} ${p.overPriced ? labels.overPricedNote : ''}`
            return (
              <ListItem 
                link={`/returnOrderPack/${props.id}/pack/${p.packId}`}
                key={p.packId} 
                title={productInfo.name}
                subtitle={packInfo.name}
                text={storeName ? `${labels.storeName}: ${storeName}` : ''}
                footer={`${labels.status}: ${statusNote}`}
                after={(p.gross / 1000).toFixed(3)}
              >
                {changePriceNote ? <div className="list-subtext1">{changePriceNote}</div> : ''}
                <div className="list-subtext2">{quantityDetails(p)}</div>
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
