import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar} from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import ReLogin from './relogin'

const Purchases = props => {
  const { state, user } = useContext(StoreContext)
  const purchases = useMemo(() => {
    const purchases = state.purchases.map(p => {
      const storeInfo = state.stores.find(s => s.id === p.storeId)
      return {
        ...p,
        storeInfo
      }
    })
    return purchases.sort((p1, p2) => p2.time.seconds - p1.time.seconds)
  }, [state.purchases, state.stores])

  if (!user) return <ReLogin />
  return(
    <Page>
      <Navbar title={labels.purchases} backLink={labels.back} />
      <Block>
        <List mediaList>
          {purchases.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : purchases.map(p => 
              <ListItem
                link={`/purchase-details/${p.id}`}
                title={p.storeInfo.name}
                subtitle={moment(p.time.toDate()).fromNow()}
                after={((p.total - p.discount) / 1000).toFixed(3)}
                key={p.id}
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

export default Purchases
