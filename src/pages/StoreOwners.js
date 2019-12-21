import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';


const StoreOwners = props => {
  const { state } = useContext(StoreContext)
  const store = useMemo(() => state.stores.find(s => s.id === props.id)
  , [state.stores, props.id])
  const storeOwners = useMemo(() => state.customers.filter(c => c.storeId === props.id)
  , [state.customers, props.id])
  return (
    <Page>
      <Navbar title={`${state.labels.storeOwners} ${store.name}`} backLink={state.labels.back} className="page-title" />
      <Block>
        <List>
          {storeOwners.length === 0 ? 
            <ListItem title={state.labels.noData} /> 
          : storeOwners.map(o => {
              const userInfo = state.users.find(u => u.id === o.id)
              return (
                <ListItem 
                  link="#"
                  title={userInfo.name} 
                  footer={userInfo.mobile}
                  key={o.id} 
                />
              )
            })
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
