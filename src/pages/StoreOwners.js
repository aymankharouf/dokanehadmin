import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';


const StoreOwners = props => {
  const { state } = useContext(StoreContext)
  const store = useMemo(() => state.stores.find(rec => rec.id === props.id)
  , [state.stores, props.id])
  const storeOwners = useMemo(() => state.customers.filter(rec => rec.storeId === props.id)
  , [state.customers, props.id])
  return (
    <Page>
      <Navbar title={`${state.labels.storeOwners} - ${store.name}`} backLink={state.labels.back} />
      <Block>
        <List>
          {storeOwners && storeOwners.map(rec => {
            const userInfo = state.users.find(user => user.id === rec.id)
            return (
              <ListItem 
                link="#"
                title={userInfo.name} 
                footer={userInfo.mobile}
                key={rec.id} 
              />
            )
          })}
          {storeOwners.length === 0 ? <ListItem title={state.labels.noData} /> : ''}
        </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default StoreOwners
