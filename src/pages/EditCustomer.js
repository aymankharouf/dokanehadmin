import React, { useState, useContext, useMemo, useEffect } from 'react'
import { Page, Navbar, List, ListInput, Fab, Icon, Toolbar, ListItem, Toggle } from 'framework7-react';
import { StoreContext } from '../data/Store';
import BottomToolbar from './BottomToolbar';
import { editCustomer, showMessage, showError, getMessage } from '../data/Actions'


const EditCustomer = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const customer = useMemo(() => state.customers.find(c => c.id === props.id)
  , [state.customers, props.id])
  const userInfo = useMemo(() => state.users.find(u => u.id === props.id)
  , [state.users, props.id])
  const [name, setName] = useState(userInfo.name)
  const [nickName, setNickName] = useState(customer.name)
  const [address, setAddress] = useState(customer.address)
  const [storeId, setStoreId] = useState(customer.storeId)
  const [locationId, setLocationId] = useState(customer.locationId)
  const [isOldAge, setIsOldAge] = useState(customer.isOldAge)
  const [position, setPosition] = useState(customer.position)
  const [otherMobile, setOtherMobile] = useState(customer.otherMobile)
  const [otherMobileErrorMessage, setOtherMobileErrorMessage] = useState('')
  const [otherMobileHolder, setOtherMobileHolder] = useState(customer.otherMobileHolder)
  const [isBlocked, setIsBlocked] = useState(customer.isBlocked)
  const [exceedPrice, setExceedPrice] = useState(customer.exceedPrice)
  const [deliveryFees, setDeliveryFees] = useState((customer.deliveryFees / 1000).toFixed(3))
  const stores = useMemo(() => {
    const stores = state.stores.filter(s => s.id !== 's')
    return stores.sort((s1, s2) => s1.name > s2.name ? 1 : -1)
  }, [state.stores]) 
  const locations = useMemo(() => [...state.locations].sort((l1, l2) => l1.sorting - l2.sorting)
  , [state.locations])
  const hasChanged = useMemo(() => {
    if (name !== userInfo.name) return true
    if (nickName !== customer.name) return true
    if (address !== customer.address) return true
    if (storeId !== customer.storeId) return true
    if (locationId !== customer.locationId) return true
    if (isOldAge !== customer.isOldAge) return true
    if (position !== customer.position) return true
    if (isBlocked !== customer.isBlocked) return true
    if (otherMobile !== customer.otherMobile) return true
    if (otherMobileHolder !== customer.otherMobileHolder) return true
    if (exceedPrice !== customer.exceedPrice) return true
    if (deliveryFees * 1000 !== customer.deliveryFees) return true
    return false
  }, [userInfo, customer, name, nickName, address, storeId, locationId, isOldAge, position, isBlocked, otherMobile, otherMobileHolder, exceedPrice, deliveryFees])
  useEffect(() => {
    const patterns = {
      mobile: /^07[7-9][0-9]{7}$/
    }
    const validateMobile = value => {
      if (patterns.mobile.test(value)){
        setOtherMobileErrorMessage('')
      } else {
        setOtherMobileErrorMessage(state.labels.invalidMobile)
      }
    }
    if (otherMobile) validateMobile(otherMobile)
  }, [otherMobile, state.labels])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])

  const handleSubmit = async () => {
    try{
      const customer = {
        id: props.id,
        name: nickName,
        storeId,
        address,
        locationId,
        isOldAge,
        position,
        isBlocked,
        otherMobile,
        otherMobileHolder,
        exceedPrice,
        deliveryFees: deliveryFees * 1000
      }
      await editCustomer(customer, name)
      showMessage(state.labels.editSuccess)
      props.f7router.back()    
    } catch(err) {
			setError(getMessage(props, err))
		}
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
          name="nickName" 
          label={state.labels.nickName}
          value={nickName}
          floatingLabel 
          clearButton
          type="text" 
          onChange={e => setNickName(e.target.value)}
          onInputClear={() => setNickName('')}
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
          title={state.labels.store}
          smartSelect
          smartSelectParams={{
            openIn: "popup", 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: state.labels.search,
            popupCloseLinkText: state.labels.close
          }}
        >
          <select name="store" value={storeId} onChange={e => setStoreId(e.target.value)}>
            <option value=""></option>
            {stores.map(s => 
              <option key={s.id} value={s.id}>{s.name}</option>
            )}
          </select>
        </ListItem>
        <ListItem
          title={state.labels.location}
          smartSelect
          smartSelectParams={{
            openIn: "popup", 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: state.labels.search,
            popupCloseLinkText: state.labels.close
          }}
        >
          <select name="locationId" value={locationId} onChange={e => setLocationId(e.target.value)}>
            <option value=""></option>
            {locations.map(l => 
              <option key={l.id} value={l.id}>{l.name}</option>
            )}
          </select>
        </ListItem>
        <ListItem>
          <span>{state.labels.isOldAge}</span>
          <Toggle color="blue" checked={isOldAge} onToggleChange={() => setIsOldAge(!isOldAge)} />
        </ListItem>
        <ListItem>
          <span>{state.labels.isBlocked}</span>
          <Toggle color="blue" checked={isBlocked} onToggleChange={() => setIsBlocked(!isBlocked)} />
        </ListItem>
        <ListItem>
          <span>{state.labels.exceedPrice}</span>
          <Toggle color="blue" checked={exceedPrice} onToggleChange={() => setExceedPrice(!exceedPrice)} />
        </ListItem>
        <ListInput 
          name="deliveryFees" 
          label={state.labels.deliveryFees}
          value={deliveryFees}
          floatingLabel 
          clearButton
          type="number" 
          onChange={e => setDeliveryFees(e.target.value)}
          onInputClear={() => setDeliveryFees('')}
        />
        <ListInput
          label={state.labels.otherMobile}
          floatingLabel
          type="number"
          name="otherMobile"
          clearButton
          value={otherMobile}
          errorMessage={otherMobileErrorMessage}
          errorMessageForce
          onChange={e => setOtherMobile(e.target.value)}
          onInputClear={() => setOtherMobile('')}
        />
        {otherMobile ? 
          <ListItem
            title={state.labels.otherMobileHolder}
            smartSelect
            smartSelectParams={{
              openIn: "popup", 
              closeOnSelect: true, 
              searchbar: true, 
              searchbarPlaceholder: state.labels.search,
              popupCloseLinkText: state.labels.close
            }}
          >
            <select name="otherMobileHolder" value={otherMobileHolder} onChange={e => setOtherMobileHolder(e.target.value)}>
              <option value=""></option>
              {state.otherMobileHolders.map(h => 
                <option key={h.id} value={h.id}>{h.name}</option>
              )}
            </select>
          </ListItem>
        : ''}
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
      {!name || !locationId || !hasChanged ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default EditCustomer
