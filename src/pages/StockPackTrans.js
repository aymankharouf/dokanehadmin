import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Badge } from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/Store';


const StockPackTrans = props => {
  const { state } = useContext(StoreContext)
  const pack = useMemo(() => state.packs.find(p => p.id === props.id)
  , [state.packs, props.id])
  const product = useMemo(() => state.products.find(p => p.id === pack.productId)
  , [state.products, pack])
  const packTrans = useMemo(() => {
    const stockTrans = state.stockTrans.filter(t => t.basket.find(p => p.packId === pack.id))
    const packTrans = stockTrans.map(t => {
      const transPack = t.basket.find(p => p.packId === pack.id)
      return {
        ...transPack,
        id: t.id,
        storeId: t.storeId,
        type: t.type,
        time: t.time
      }
    })
    return packTrans.sort((t1, t2) => t2.time.seconds - t1.time.seconds)
  }, [state.stockTrans, pack])
  return(
    <Page>
      <Navbar title={`${product.name} ${pack.name}`} backLink={state.labels.back} />
      <Block>
        <List mediaList>
          {packTrans && packTrans.map(t => 
            <ListItem
              title={t.type === 's' || t.type === 'i' ? state.stockTransTypes.find(ty => ty.id === t.type).name : state.stores.find(s => s.id === t.storeId).name}
              subtitle={moment(t.time.toDate()).fromNow()}
              after={(t.purchasePrice / 1000).toFixed(3)}
              key={t.id}
            >
              <Badge slot="title" color="red">{t.quantity}</Badge>
            </ListItem>
          )}
          {packTrans.length === 0 ? <ListItem title={state.labels.noData} /> : ''}
        </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default StockPackTrans
