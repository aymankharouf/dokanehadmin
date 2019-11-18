import React, { useState, useContext, useMemo } from 'react'
import { Page, Navbar, List, ListInput, Fab, Icon, Toolbar, ListItem } from 'framework7-react';
import { StoreContext } from '../data/Store';
import BottomToolbar from './BottomToolbar';
import { approveUser, showMessage } from '../data/Actions'


const ApproveUser = props => {
  const { state } = useContext(StoreContext)
  const userInfo = useMemo(() => state.users.find(rec => rec.id === props.id)
  , [state.users, props.id])
  const [name, setName] = useState(userInfo.name)
  const [locationId, setLocationId] = useState('')
  const [address, setAddress] = useState('')
  const [storeId, setStoreId] = useState('')
  const stores = useMemo(() => {
    const stores = state.stores.filter(rec => rec.id !== 's')
    return stores.sort((rec1, rec2) => rec1.name > rec2.name ? 1 : -1)
  }, [state.stores]) 
  const locations = useMemo(() => [...state.locations].sort((rec1, rec2) => rec1.name > rec2.name ? 1 : -1)
  , [state.locations]) 
  const handleSubmit = () => {
    approveUser({
      id: props.id,
      name,
      storeId,
      locationId,
      address,
    }).then(() => {
      showMessage(props, 'success', state.labels.approveSuccess)
      props.f7router.back()  
    })
  }
  return (
    <Page>
      <Navbar title={state.labels.approveUser} backLink={state.labels.back} />
      <List form>
        <ListInput 
          name="name" 
          label={state.labels.name}
          floatingLabel 
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <ListInput 
          name="mobile" 
          label={state.labels.mobile}
          floatingLabel 
          type="number"
          value={userInfo.mobile}
          readonly
        />
        <ListInput 
          name="storeName" 
          label={state.labels.storeName}
          floatingLabel 
          type="text"
          value={userInfo.storeName || ''}
          readonly
        />
        <ListItem
          title={state.labels.store}
          smartSelect
          smartSelectParams={{
            openIn: 'popup', 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: state.labels.search,
            popupCloseLinkText: state.labels.close
          }}
        >
          <select name="store" value={storeId} onChange={e => setStoreId(e.target.value)}>
            <option value=""></option>
            {stores.map(rec => 
              <option key={rec.id} value={rec.id}>
                {rec.name}
              </option>
            )}
          </select>
        </ListItem>
        <ListItem
          title={state.labels.location}
          smartSelect
          smartSelectParams={{
            openIn: 'popup', 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: state.labels.search,
            popupCloseLinkText: state.labels.close
          }}
        >
          <select name="locationId" value={locationId} onChange={e => setLocationId(e.target.value)}>
            <option value=""></option>
            {locations.map(rec => 
              <option key={rec.id} value={rec.id}>
                {rec.name}
              </option>
            )}
          </select>
        </ListItem>
        <ListInput 
          name="address" 
          label={state.labels.address}
          floatingLabel 
          type="text" 
          value={address}
          onChange={e => setAddress(e.target.value)}
        />
      </List>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
      {!name || (userInfo.storeName && !storeId)
      ? ''
      : <Fab position="left-top" slot="fixed" color="green" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default ApproveUser
