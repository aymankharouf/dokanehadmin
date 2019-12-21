import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/Store';
import BottomToolbar from './BottomToolbar';


const StockTrans = props => {
  const { state } = useContext(StoreContext)
  const stockTrans = useMemo(() => [...state.stockTrans].sort((t1, t2) => t2.time.seconds - t1.time.seconds)
  , [state.stockTrans])
  return(
    <Page>
      <Navbar title={state.labels.stockTrans} backLink={state.labels.back} className="page-title" />
      <Block>
        <List mediaList>
          {stockTrans.length === 0 ? 
            <ListItem title={state.labels.noData} /> 
          : stockTrans.map(t => 
              <ListItem
                link={`/stockTrans/${t.id}`}
                title={`${state.stockTransTypes.find(ty => ty.id === t.type).name} ${t.storeId ? state.stores.find(s => s.id === t.storeId).name : ''}`}
                text={moment(t.time.toDate()).fromNow()}
                after={(t.total / 1000).toFixed(3)}
                key={t.id}
              />
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

export default StockTrans
