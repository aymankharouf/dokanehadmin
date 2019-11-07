import React, { useState, useContext, useMemo } from 'react'
import { Page, Navbar, List, ListInput, Fab, Icon, Toolbar, ListItem, Toggle } from 'framework7-react';
import { StoreContext } from '../data/Store';
import BottomToolbar from './BottomToolbar';
import { editCustomer, showMessage, editUser } from '../data/Actions'


const EditCustomer = props => {
  const { state } = useContext(StoreContext)
  const customer = useMemo(() => state.customers.find(rec => rec.id === props.id), [state.customers])
  const userInfo = useMemo(() => state.users.find(rec => rec.id === props.id), [state.users])
  const [name, setName] = useState(userInfo.name)
  const [address, setAddress] = useState(customer.address)
  const [type, setType] = useState(customer.type)
  const [storeId, setStoreId] = useState(customer.storeId)
  const [deliveryFees, setDeliveryFees] = useState(customer.deliveryFees)
  const [isOld, setIsOld] = useState(customer.isOld)
  const [position, setPosition] = useState(customer.position)
  const storesTags = useMemo(() => {
    const stores = state.stores.filter(rec => rec.id !== 's')
    stores.sort((rec1, rec2) => rec1.name > rec2.name ? 1 : -1)
    return stores.map(rec => 
      <option key={rec.id} value={rec.id}>
        {rec.name}
      </option>
    )
  }, [state.stores]) 
  const customerTypesTags = useMemo(() => state.customerTypes.map(rec => 
    <option key={rec.id} value={rec.id}>
      {rec.name}
    </option>
  ), [state.customerTypes])
  const handleSubmit = () => {
    editCustomer({
      id: props.id,
      storeId,
      type,
      address,
      deliveryFees: deliveryFees * 1000,
      isOld,
      position
    }).then(() => {
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
            <option value="" disabled></option>
            {customerTypesTags}
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
            <option value="" disabled></option>
            {storesTags}
          </select>
        </ListItem>
        <ListInput 
          name="deliveryFees" 
          label={state.labels.deliveryFees}
          value={(customer.deliveryFees / 1000).toFixed(3)}
          floatingLabel 
          type="number"
          clearButton
          onChange={(e) => setDeliveryFees(e.target.value)}
          onInputClear={() => setDeliveryFees('')}
        />
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
          onChange={(e) => setAddress(e.target.value)}
          onInputClear={() => setAddress('')}
        />
      </List>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
      {!name || (type === 'o' && !storeId) || (name === userInfo.name && address === customer.address && type === customer.type && storeId === customer.storeId && deliveryFees === customer.deliveryFees)
      ? ''
      : <Fab position="left-top" slot="fixed" color="green" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default EditCustomer
