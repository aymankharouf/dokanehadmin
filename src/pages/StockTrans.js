import React, { useContext } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Badge} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/Store';


const StockTrans = props => {
  const { state, stockTrans, products } = useContext(StoreContext)
  const product = products.find(rec => rec.id === props.id)
  let trans = stockTrans
  trans.sort((trans1, trans2) => trans1.time.seconds - trans2.time.seconds)
  return(
    <Page>
      <Navbar title={`${product.name} ${product.description}`} backLink="Back" />
      <Block>
        <List mediaList>
          {trans && trans.map(trans => 
            <ListItem
              title={state.stores.find(rec => rec.id === trans.storeId).name}
              subtitle={moment(trans.time.toDate()).fromNow()}
              after={(trans.purchasePrice).toFixed(3)}
              key={trans.id}
            >
              <Badge slot="title" color="red">{trans.quantity}</Badge>
            </ListItem>
          )}
          { trans.length === 0 ? <ListItem title={state.labels.noData} /> : null }
        </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default StockTrans
