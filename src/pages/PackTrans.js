import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Badge } from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/Store';


const PackTrans = props => {
  const { state } = useContext(StoreContext)
  const pack = useMemo(() => state.packs.find(p => p.id === props.id)
  , [state.packs, props.id])
  const product = useMemo(() => state.products.find(p => p.id === pack.productId)
  , [state.products, pack])
  const packTrans = useMemo(() => {
    const purchases = state.purchases.filter(p => p.basket.find(p => p.packId === pack.id))
    const packTrans = purchases.map(p => {
      const transPack = p.basket.find(pa => pa.packId === pack.id)
      return {
        ...transPack,
        id: p.id,
        storeId: p.storeId,
        time: p.time
      }
    })
    return packTrans.sort((t1, t2) => t2.time.seconds - t1.time.seconds)
  }, [state.purchases, pack])
  return(
    <Page>
      <Navbar title={`${product.name} ${pack.name}`} backLink={state.labels.back} />
      <Block>
        <List mediaList>
          {packTrans.length === 0 ? 
            <ListItem title={state.labels.noData} /> 
          : packTrans.map(t => 
              <ListItem
                title={state.stores.find(s => s.id === t.storeId).name}
                subtitle={moment(t.time.toDate()).fromNow()}
                after={(t.cost / 1000).toFixed(3)}
                key={t.id}
              >
                <Badge slot="title" color="red">{t.quantity}</Badge>
              </ListItem>
            )
          }
        </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default PackTrans
