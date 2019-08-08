import React, { useContext } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/Store';


const StockTrans = props => {
  const { state, products } = useContext(StoreContext)
  const product = products.find(rec => rec.id === props.id)
  let trans = state.stockTrans
  trans.sort((trans1, trans2) => trans1.time - trans2.time)
  return(
    <Page>
      <Navbar title={product.name} backLink="Back" />
      <Block>
          <List mediaList>
            {trans && trans.map(trans => 
              <ListItem
                title={trans.purchasePrice}
                after={trans.quantity}
                key={trans.id}
              />
            )}
            { trans.length === 0 ? <ListItem title={state.labels.not_found} /> : null }
          </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default StockTrans
