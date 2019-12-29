import React, { useContext, useMemo } from 'react'
import { Page, Navbar, List, ListItem, ListInput, Fab, Icon, Toolbar, Toggle } from 'framework7-react'
import { StoreContext } from '../data/store'
import BottomToolbar from './BottomToolbar'


const StoreDetails = props => {
  const { state } = useContext(StoreContext)
  const store = useMemo(() => state.stores.find(s => s.id === props.id)
  , [state.stores, props.id])
  const storeOwners = useMemo(() => state.customers.filter(c => c.storeId === props.id)
  , [state.customers, props.id])

  return (
    <Page>
      <Navbar title={state.labels.storeDetails} backLink={state.labels.back} />
      <List form>
        <ListInput 
          name="name" 
          label={state.labels.name}
          value={store.name}
          floatingLabel
          type="text" 
          readonly
        />
        <ListInput
          name="mobile"
          label={state.labels.mobile}
          value={store.mobile || ''}
          floatingLabel
          type="number"
          readonly
        />
        <ListInput
          name="type"
          label={state.labels.type}
          value={state.storeTypes.find(t => t.id === store.type).name}
          floatingLabel
          type="text"
          readonly
        />
        <ListInput
          name="discount"
          label={state.labels.discount}
          value={store.discount || ''}
          floatingLabel
          type="number"
          readonly
        />
        <ListItem>
          <span>{state.labels.canReturn}</span>
          <Toggle 
            name="canReturn" 
            color="green" 
            checked={store.canReturn || false} 
            disabled
          />
        </ListItem>
        <ListInput
          name="location"
          label={state.labels.location}
          value={store.locationId ? state.locations.find(l => l.id === store.locationId).name : ''}
          floatingLabel
          type="text"
          readonly
        />
        <ListInput 
          name="address" 
          label={state.labels.address}
          value={store.address || ''}
          floatingLabel
          type="text"
        />
        <ListItem
          link={`/storeOwners/${store.id}`}
          title={state.labels.storeOwners}
          after={storeOwners.length}
        />
      </List>
      {store.id === 's' ? '' :
        <Fab position="left-top" slot="fixed" color="red" className="top-fab" href={`/editStore/${props.id}`}>
          <Icon material="edit"></Icon>
        </Fab>    
      }
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}
export default StoreDetails
