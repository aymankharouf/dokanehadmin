import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import { StoreContext } from '../data/store'
import { quantityDetails } from '../data/actions'
import labels from '../data/labels'
import { orderPackStatus } from '../data/config'
import BottomToolbar from './bottom-toolbar'

const ReturnOrder = props => {
  const { state } = useContext(StoreContext)
  const orderBasket = useMemo(() => {
    const order = state.orders.find(o => o.id === props.id)
    let basket = order.basket
    basket = basket.map(p => {
      const packInfo = state.packs.find(pa => pa.id === p.packId)
      const storeName = p.storeId ? (p.storeId === 'm' ? labels.multipleStores : state.stores.find(s => s.id === p.storeId).name) : ''
      const changePriceNote = p.actual && p.actual !== p.price ? `${labels.orderPrice}: ${(p.price / 1000).toFixed(3)}, ${labels.currentPrice}: ${(p.actual / 1000).toFixed(3)}` : ''
      const statusNote = `${orderPackStatus.find(s => s.id === p.status).name} ${p.overPriced ? labels.overPricedNote : ''}`
      return {
        ...p,
        packInfo,
        storeName,
        changePriceNote,
        statusNote
      }
    })
    return basket
  }, [state.orders, state.packs, state.stores, props.id])

  return(
    <Page>
      <Navbar title={labels.returnOrder} backLink={labels.back} />
      <Block>
        <List mediaList>
          {orderBasket.map(p => 
            <ListItem 
              link={`/return-order-pack/${props.id}/pack/${p.packId}`}
              key={p.packId} 
              title={p.packInfo.productName}
              subtitle={p.packInfo.name}
              text={p.storeName ? `${labels.storeName}: ${p.storeName}` : ''}
              footer={`${labels.status}: ${p.statusNote}`}
              after={(p.gross / 1000).toFixed(3)}
            >
              {p.changePriceNote ? <div className="list-subtext1">{p.changePriceNote}</div> : ''}
              <div className="list-subtext2">{quantityDetails(p)}</div>
            </ListItem>
          )}
        </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}
export default ReturnOrder
