import React, { useContext, useState } from 'react'
import { Page, Navbar, List, ListItem, ListInput, Fab, Icon, Toolbar, Toggle, FabButton, FabButtons } from 'framework7-react'
import { StoreContext } from '../data/store'
import BottomToolbar from './bottom-toolbar'
import labels from '../data/labels'
import { storeTypes } from '../data/config'

const StoreDetails = props => {
  const { state } = useContext(StoreContext)
  const [store] = useState(() => state.stores.find(s => s.id === props.id))

  return (
    <Page>
      <Navbar title={labels.storeDetails} backLink={labels.back} />
      <List form>
        <ListInput 
          name="name" 
          label={labels.name}
          value={store.name}
          type="text" 
          readonly
        />
        <ListInput
          name="mobile"
          label={labels.mobile}
          value={store.mobile || ''}
          type="number"
          readonly
        />
        <ListInput
          name="type"
          label={labels.type}
          value={storeTypes.find(t => t.id === store.type).name}
          type="text"
          readonly
        />
        <ListInput
          name="discount"
          label={labels.discount}
          value={store.discount * 100}
          type="number"
          readonly
        />
        <ListItem>
          <span>{labels.allowReturn}</span>
          <Toggle 
            name="allowReturn" 
            color="green" 
            checked={store.allowReturn || false} 
            disabled
          />
        </ListItem>
        <ListInput
          name="location"
          label={labels.location}
          value={state.locations.find(l => l.id === store.locationId)?.name || ''}
          type="text"
          readonly
        />
        <ListInput
          name="openTime"
          label={labels.openTime}
          value={store.openTime || ''}
          type="text"
          readonly
        />
        <ListInput 
          name="address" 
          label={labels.address}
          value={store.address || ''}
          type="text"
        />
      </List>
      {store.id === 's' ? '' :
        <Fab position="left-top" slot="fixed" color="orange" className="top-fab">
          <Icon material="keyboard_arrow_down"></Icon>
          <Icon material="close"></Icon>
          <FabButtons position="bottom">
            <FabButton color="green" onClick={() => props.f7router.navigate(`/store-packs/${props.id}`)}>
              <Icon material="shopping_cart"></Icon>
            </FabButton>
            <FabButton color="blue" onClick={() => props.f7router.navigate(`/edit-store/${props.id}`)}>
              <Icon material="edit"></Icon>
            </FabButton>
            <FabButton color="yellow" onClick={() => props.f7router.navigate(`/store-trans/${store.id}`)}>
              <Icon material="import_export"></Icon>
            </FabButton>
            <FabButton color="red" onClick={() => props.f7router.navigate(`/store-owners/${store.id}`)}>
              <Icon material="perm_identity"></Icon>
            </FabButton>
          </FabButtons>
        </Fab>
      }
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}
export default StoreDetails
