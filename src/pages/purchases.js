import React, { useContext, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { purchaseTypes } from '../data/config'

const Purchases = props => {
  const { state, user } = useContext(StoreContext)
  const [purchases, setPurchases] = useState([])
  useEffect(() => {
    setPurchases(() => {
      const purchases = state.purchases.map(p => {
        const storeInfo = state.stores.find(s => s.id === p.storeId)
        return {
          ...p,
          storeInfo
        }
      })
      return purchases.sort((p1, p2) => p2.time.seconds - p1.time.seconds)
    })
  }, [state.purchases, state.stores])

  if (!user) return <Page><h3 className="center"><a href="/login/">{labels.relogin}</a></h3></Page>
  return(
    <Page>
      <Navbar title={labels.purchases} backLink={labels.back} />
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => props.f7router.navigate('/archived-purchases/')}>
        <Icon material="backup"></Icon>
      </Fab>
      <Block>
        <List mediaList>
          {purchases.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : purchases.map(p => 
              <ListItem
                link={`/purchase-details/${p.id}/type/n`}
                title={p.storeInfo.name}
                subtitle={purchaseTypes.find(t => t.id === p.type).name}
                text={moment(p.time.toDate()).fromNow()}
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
