import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import BottomToolbar from './BottomToolbar'
import labels from '../data/labels'
import { stockTransTypes } from '../data/config'

const StockTrans = props => {
  const { state } = useContext(StoreContext)
  const stockTrans = useMemo(() => [...state.stockTrans].sort((t1, t2) => t2.time.seconds - t1.time.seconds)
  , [state.stockTrans])
  return(
    <Page>
      <Navbar title={labels.stockTrans} backLink={labels.back} />
      <Block>
        <List mediaList>
          {stockTrans.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : stockTrans.map(t => 
              <ListItem
                link={`/stockTransDetails/${t.id}`}
                title={`${stockTransTypes.find(ty => ty.id === t.type).name} ${t.storeId ? state.stores.find(s => s.id === t.storeId).name : ''}`}
                subtitle={moment(t.time.toDate()).fromNow()}
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
