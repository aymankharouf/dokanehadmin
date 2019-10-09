import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/Store';
import BottomToolbar from './BottomToolbar';


const StockTrans = props => {
  const { state } = useContext(StoreContext)
  const stockTrans = useMemo(() => [...state.stockTrans].sort((rec1, rec2) => rec2.time.seconds - rec1.time.seconds), [state.stockTrans])
  return(
    <Page>
      <Navbar title={state.labels.stockTrans} backLink={state.labels.back} />
      <Block>
          <List mediaList>
            {stockTrans && stockTrans.map(trans => 
              <ListItem
                link={`/stockTrans/${trans.id}`}
                title={state.stockTransTypes.find(rec => rec.id === trans.type).name}
                text={moment(trans.time.toDate()).fromNow()}
                key={trans.id}
              />
            )}
            { stockTrans.length === 0 ? <ListItem title={state.labels.noData} /> : null }
          </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default StockTrans
