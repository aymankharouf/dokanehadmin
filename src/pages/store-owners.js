import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'


const StoreOwners = props => {
  const { state } = useContext(StoreContext)
  const store = useMemo(() => state.stores.find(s => s.id === props.id)
  , [state.stores, props.id])
  const storeOwners = useMemo(() => {
    let storeOwners = state.customers.filter(c => c.storeId === props.id)
    storeOwners = storeOwners.map(o => {
      const userInfo = state.users.find(u => u.id === o.id)
      const customerInfo = state.customers.find(c => c.id === o.id)
      return {
        ...o,
        userInfo,
        customerInfo
      }
    })
    return storeOwners
  }, [state.customers, state.users, props.id])
  return (
    <Page>
      <Navbar title={`${labels.storeOwners} ${store.name}`} backLink={labels.back} />
      <Block>
        <List mediaList>
          {storeOwners.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : storeOwners.map(o => 
              <ListItem 
                link="#"
                title={o.customerInfo.fullName || `${o.userInfo.name}:${o.userInfo.mobile}`} 
                key={o.id} 
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

export default StoreOwners
