import React, { useContext } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar} from 'framework7-react'
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
      <Navbar title={`${product.name} ${product.size} ${state.units.find(rec => rec.id === product.unit).name}`} backLink="Back" />
      <Block>
          <List mediaList>
            {trans && trans.map(trans => 
              <ListItem
                title={moment(trans.time.toDate()).fromNow()}
                footer={trans.purchasePrice}
                after={trans.quantity}
                key={trans.id}
              />
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
