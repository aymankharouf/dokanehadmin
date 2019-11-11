import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Badge} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/Store';


const PackTrans = props => {
  const { state } = useContext(StoreContext)
  const pack = useMemo(() => state.packs.find(rec => rec.id === props.id), [state.packs])
  const product = useMemo(() => state.products.find(rec => rec.id === pack.productId), [state.products])
  const packTrans = useMemo(() => {
    const stockTrans = state.stockTrans.filter(trans => trans.basket.find(rec => rec.id === pack.id))
    const packTrans = stockTrans.map(trans => {
      const transPack = trans.basket.find(rec => rec.id === pack.id)
      return {
        ...transPack,
        id: trans.id,
        storeId: trans.storeId,
        type: trans.type,
        time: trans.time
      }
    })
    return packTrans.sort((rec1, rec2) => rec2.time.seconds - rec1.time.seconds)
  }, [state.packTrans])
  return(
    <Page>
      <Navbar title={`${product.name} ${pack.name}`} backLink={state.labels.back} />
      <Block>
        <List mediaList>
          {packTrans && packTrans.map(trans => 
            <ListItem
              title={trans.type === 's' ? state.stockTransTypes.find(rec => rec.id === trans.type).name : state.stores.find(rec => rec.id === trans.storeId).name}
              subtitle={moment(trans.time.toDate()).fromNow()}
              after={(trans.purchasePrice / 1000).toFixed(3)}
              key={trans.id}
            >
              <Badge slot="title" color="red">{trans.quantity}</Badge>
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

export default PackTrans
