import React, { useContext, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import PackImage from './pack-image'
import { quantityText } from '../data/actions'
import labels from '../data/labels'
import { stockTransTypes } from '../data/config'

const StockTransDetails = props => {
  const { state } = useContext(StoreContext)
  const [stockTrans] = useState(() => state.stockTrans.find(t => t.id === props.id))
  const [stockTransBasket, setStockTransBasket] = useState([])
  useEffect(() => {
    setStockTransBasket(() => stockTrans.basket.map(p => {
      const packInfo = state.packs.find(pa => pa.id === p.packId)
      return {
        ...p,
        packInfo
      }
    }))
  }, [stockTrans, state.packs])
  return(
    <Page>
      <Navbar title={`${stockTransTypes.find(ty => ty.id === stockTrans.type).name} ${stockTrans.storeId ? state.stores.find(s => s.id === stockTrans.storeId).name : ''}`} backLink={labels.back} />
      <Block>
        <List mediaList>
          {stockTransBasket.map(p => 
            <ListItem 
              title={p.packInfo.productName}
              subtitle={p.packInfo.name}
              text={`${labels.quantity}: ${quantityText(p.quantity)}`}
              after={(parseInt(p.cost * p.quantity) / 1000).toFixed(3)}
              key={p.packId}
            >
              <PackImage slot="media" pack={p.packInfo} type="list" />
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
export default StockTransDetails
