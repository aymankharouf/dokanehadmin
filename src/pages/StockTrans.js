import React, { useContext } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/Store';
import BottomToolbar from './BottomToolbar';


const StockTrans = props => {
  const { state, stockTrans } = useContext(StoreContext)
  let trans = stockTrans
  trans.sort((trans1, trans2) => trans2.time.seconds - trans1.time.seconds)
  return(
    <Page>
      <Navbar title={state.labels.stockTrans} backLink="Back" />
      <Block>
          <List mediaList>
            {trans && trans.map(trans => 
              <ListItem
                link={`/stockTrans/${trans.id}`}
                title={state.stockTransTypes.find(rec => rec.id === trans.type).name}
                text={moment(trans.time.toDate()).fromNow()}
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