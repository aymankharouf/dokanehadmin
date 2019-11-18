import React, { useState, useContext, useMemo } from 'react'
import { Page, Navbar, List, ListInput, Fab, Icon, Toolbar, ListItem, Toggle } from 'framework7-react';
import { StoreContext } from '../data/Store';
import BottomToolbar from './BottomToolbar';
import { editCustomer, showMessage } from '../data/Actions'


const EditCustomer = props => {
  const { state } = useContext(StoreContext)
  const customer = useMemo(() => state.customers.find(c => c.id === props.id)
  , [state.customers, props.id])
  const userInfo = useMemo(() => state.users.find(u => u.id === props.id)
  , [state.users, props.id])
  const [name, setName] = useState(userInfo.name)
  const [address, setAddress] = useState(customer.address)
  const [type, setType] = useState(customer.type)
  const [storeId, setStoreId] = useState(customer.storeId)
  const [locationId, setLocationId] = useState(customer.locationId)
  const [isOldAge, setIsOldAge] = useState(customer.isOldAge)
  const [position, setPosition] = useState(customer.position)
  const stores = useMemo(() => {
    const stores = state.stores.filter(s => s.id !== 's')
    return stores.sort((s1, s2) => s1.name > s2.name ? 1 : -1)
  }, [state.stores]) 
  const customerTypes = useMemo(() => [...state.customerTypes].sort((t1, t2) => t1.name > t2.name ? 1 : -1)
  , [state.customerTypes])
  const locations = useMemo(() => [...state.locations].sort((l1, l2) => l1.name > l2.name ? 1 : -1)
  , [state.locations])
  const handleSubmit = () => {
    const customer = {
      id: props.id,
      storeId,
      type,
      address,
      locationId,
      isOldAge,
      position
    }
    editCustomer(customer, name).then(() => {
      showMessage(props, 'success', state.labels.editSuccess)
      props.f7router.back()  
    })
  }
  return (
    <Page>
      <Navbar title={state.labels.editCustomer} backLink={state.labels.back} />
      <List form>
        <ListInput 
          name="name" 
          label={state.labels.name}
          value={name}
          floatingLabel 
          clearButton
          type="text" 
          onChange={e => setName(e.target.value)}
          onInputClear={() => setName('')}
        />
        <ListInput 
          name="mobile" 
          label={state.labels.mobile}
          value={userInfo.mobile}
          floatingLabel 
          type="number"
          readonly
        />
        <ListItem
          title={state.labels.type}
          smartSelect
          smartSelectParams={{
            openIn: 'popup', 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: state.labels.search,
            popupCloseLinkText: state.labels.close
          }}
        >
          <select name="type" value={type} onChange={e => setType(e.target.value)}>
            <option value=""></option>
            {customerTypes.map(t => 
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            )}
          </select>
        </ListItem>
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
            {stores.map(s => 
              <option key={s.id} value={s.id}>
                {s.name}
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
          <select name="location" value={locationId} onChange={e => setLocationId(e.target.value)}>
            <option value=""></option>
            {locations.map(l => 
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            )}
          </select>
        </ListItem>
        <ListItem>
          <span>{state.labels.isOldAge}</span>
          <Toggle color="blue" checked={isOldAge} onToggleChange={() => setIsOldAge(!isOldAge)} />
        </ListItem>
        <ListInput 
          name="position" 
          label={state.labels.position}
          value={position}
          floatingLabel 
          clearButton
          type="text" 
          onChange={e => setPosition(e.target.value)}
          onInputClear={() => setPosition('')}
        />
        <ListInput 
          name="address" 
          label={state.labels.address}
          value={address}
          floatingLabel 
          clearButton
          type="text" 
          onChange={e => setAddress(e.target.value)}
          onInputClear={() => setAddress('')}
        />
      </List>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
      {!name || (type === 'o' && !storeId) || (name === userInfo.name && address === customer.address && type === customer.type && storeId === customer.storeId && locationId === customer.locationId && isOldAge === customer.isOldAge && position === customer.position)
      ? ''
      : <Fab position="left-top" slot="fixed" color="green" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default EditCustomer
