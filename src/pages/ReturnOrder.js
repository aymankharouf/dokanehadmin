import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Badge, Link } from 'framework7-react'
import ReLogin from './ReLogin'
import { StoreContext } from '../data/Store';
import { quantityText } from '../data/Actions'

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
            const price = p.status === 'r' ? 0 : p.status === 'pr' ? p.actualPrice * ((p.weight ? p.weight : p.purchasedQuantity) - p.returnedQuantity) : p.actualPrice * (p.weight ? p.weight : p.purchasedQuantity)
            return (
              <ListItem 
                link={`/returnOrder/${props.id}/pack/${p.packId}`}
                key={p.packId} 
                title={productInfo.name}
                subtitle={packInfo.name}
                text={storeName}
                footer={state.orderPackStatus.find(s => s.id === p.status).name}
                after={(price / 1000).toFixed(3)}
              >
                {p.purchasedQuantity - (p.returnedQuantity ? p.returnedQuantity : 0) > 0 ? <Badge slot="title" color="green">{quantityText(p.purchasedQuantity - (p.returnedQuantity ? p.returnedQuantity : 0), state.labels, p.weight - (p.returnedQuantity ? p.returnedQuantity : 0))}</Badge> : ''}
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
