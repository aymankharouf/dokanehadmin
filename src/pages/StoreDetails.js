import React, { useContext, useMemo } from 'react'
import { Page, Navbar, List, ListItem, ListInput, Fab, Icon, Toolbar, Toggle } from 'framework7-react'
import { StoreContext } from '../data/store'
import BottomToolbar from './BottomToolbar'
import labels from '../data/labels'
import { storeTypes } from '../data/config'

const StoreDetails = props => {
  const { state } = useContext(StoreContext)
  const store = useMemo(() => state.stores.find(s => s.id === props.id)
  , [state.stores, props.id])
  const storeOwners = useMemo(() => state.customers.filter(c => c.storeId === props.id)
  , [state.customers, props.id])

  return (
    <Page>
      <Navbar title={labels.storeDetails} backLink={labels.back} />
      <List form>
        <ListInput 
          name="name" 
          label={labels.name}
          value={store.name}
          floatingLabel
          type="text" 
          readonly
        />
        <ListInput
          name="mobile"
          label={labels.mobile}
          value={store.mobile || ''}
          floatingLabel
          type="number"
          readonly
        />
        <ListInput
          name="type"
          label={labels.type}
          value={storeTypes.find(t => t.id === store.type).name}
          floatingLabel
          type="text"
          readonly
        />
        <ListInput
          name="discount"
          label={labels.discount}
          value={store.discount || ''}
          floatingLabel
          type="number"
          readonly
        />
        <ListItem>
          <span>{labels.canReturn}</span>
          <Toggle 
            name="canReturn" 
            color="green" 
            checked={store.canReturn || false} 
            disabled
          />
        </ListItem>
        <ListInput
          name="location"
          label={labels.location}
          value={store.locationId ? state.locations.find(l => l.id === store.locationId).name : ''}
          floatingLabel
          type="text"
          readonly
        />
        <ListInput 
          name="address" 
          label={labels.address}
          value={store.address || ''}
          floatingLabel
          type="text"
        />
        <ListItem
          link={`/storeOwners/${store.id}`}
          title={labels.storeOwners}
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
