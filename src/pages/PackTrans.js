import React, { useContext } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Badge} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/Store';


const PackTrans = props => {
  const { state } = useContext(StoreContext)
  const pack = state.packs.find(rec => rec.id === props.id)
  const product = state.products.find(rec => rec.id === pack.productId)
  let packTrans = state.packTrans.filter(rec => rec.quantity > 0)
  packTrans.sort((trans1, trans2) => trans1.time.seconds - trans2.time.seconds)
  return(
    <Page>
      <Navbar title={`${product.name} ${pack.name}`} backLink={state.labels.back} />
      <Block>
        <List mediaList>
          {packTrans && packTrans.map(trans => 
            <ListItem
              title={state.stores.find(rec => rec.id === trans.storeId).name}
              subtitle={moment(trans.time.toDate()).fromNow()}
              after={(trans.purchasePrice / 1000).toFixed(3)}
              key={trans.id}
            >
              <Badge slot="title" color="red">{trans.quantity}</Badge>
            </ListItem>
          )}
          { packTrans.length === 0 ? <ListItem title={state.labels.noData} /> : null }
        </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default PackTrans
