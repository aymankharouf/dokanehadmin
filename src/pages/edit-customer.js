import React, { useState, useContext, useMemo, useEffect } from 'react'
import { Page, Navbar, List, ListInput, Fab, Icon, Toolbar, ListItem, Toggle } from 'framework7-react'
import { StoreContext } from '../data/store'
import BottomToolbar from './bottom-toolbar'
import { editCustomer, showMessage, showError, getMessage } from '../data/actions'
import labels from '../data/labels'
import { deliveryIntervals } from '../data/config'

const EditCustomer = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const customer = useMemo(() => state.customers.find(c => c.id === props.id)
  , [state.customers, props.id])
  const userInfo = useMemo(() => state.users.find(u => u.id === props.id)
  , [state.users, props.id])
  const [name, setName] = useState(customer.name)
  const [address, setAddress] = useState(customer.address)
  const [storeId, setStoreId] = useState(customer.storeId)
  const [locationId, setLocationId] = useState(customer.locationId)
  const [isOldAge, setIsOldAge] = useState(customer.isOldAge)
  const [position, setPosition] = useState(customer.position)
  const [otherMobile, setOtherMobile] = useState(customer.otherMobile)
  const [otherMobileErrorMessage, setOtherMobileErrorMessage] = useState('')
  const [isBlocked, setIsBlocked] = useState(customer.isBlocked)
  const [exceedPrice, setExceedPrice] = useState(customer.exceedPrice)
  const [deliveryFees, setDeliveryFees] = useState((customer.deliveryFees / 1000).toFixed(3))
  const [orderLimit, setOrderLimit] = useState((customer.orderLimit / 1000).toFixed(3))
  const [deliveryInterval, setDeliveryInterval] = useState(customer.deliveryInterval || '')
  const stores = useMemo(() => {
    const stores = state.stores.filter(s => s.id !== 's')
    return stores.sort((s1, s2) => s1.name > s2.name ? 1 : -1)
  }, [state.stores]) 
  const locations = useMemo(() => [...state.locations].sort((l1, l2) => l1.ordering - l2.ordering)
  , [state.locations])
  const hasChanged = useMemo(() => {
    if (name !== userInfo.name) return true
    if (address !== customer.address) return true
    if (storeId !== customer.storeId) return true
    if (locationId !== customer.locationId) return true
    if (isOldAge !== customer.isOldAge) return true
    if (position !== customer.position) return true
    if (isBlocked !== customer.isBlocked) return true
    if (otherMobile !== customer.otherMobile) return true
    if (exceedPrice !== customer.exceedPrice) return true
    if (deliveryFees * 1000 !== customer.deliveryFees) return true
    if (orderLimit * 1000 !== customer.orderLimit) return true
    if (deliveryInterval !== customer.deliveryInterval) return true
    return false
  }, [userInfo, customer, name, address, storeId, locationId, isOldAge, position, isBlocked, otherMobile, exceedPrice, deliveryFees, orderLimit, deliveryInterval])
  useEffect(() => {
    const patterns = {
      mobile: /^07[7-9][0-9]{7}$/
    }
    const validateMobile = value => {
      if (patterns.mobile.test(value)){
        setOtherMobileErrorMessage('')
      } else {
        setOtherMobileErrorMessage(labels.invalidMobile)
      }
    }
    if (otherMobile) validateMobile(otherMobile)
  }, [otherMobile])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])

  const handleSubmit = async () => {
    try{
      const fullName = `${name}${storeId ? '-' + state.stores.find(s => s.id === storeId).name : ''}: ${userInfo.mobile}`
      const customer = {
        id: props.id,
        name,
        fullName,
        storeId,
        address,
        locationId,
        isOldAge,
        position,
        isBlocked,
        otherMobile,
        exceedPrice,
        deliveryFees: deliveryFees * 1000,
        orderLimit: orderLimit * 1000,
        deliveryInterval
      }
      await editCustomer(customer)
      showMessage(labels.editSuccess)
      props.f7router.back()    
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  return (
    <Page>
      <Navbar title={labels.editCustomer} backLink={labels.back} />
      <List form>
        <ListInput 
          name="name" 
          label={labels.name}
          value={name}
          floatingLabel 
          clearButton
          type="text" 
          onChange={e => setName(e.target.value)}
          onInputClear={() => setName('')}
        />
        <ListItem
          title={labels.store}
          smartSelect
          smartSelectParams={{
            openIn: "popup", 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close
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
          title={labels.location}
          smartSelect
          smartSelectParams={{
            openIn: "popup", 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close
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
          <span>{labels.isOldAge}</span>
          <Toggle color="blue" checked={isOldAge} onToggleChange={() => setIsOldAge(!isOldAge)} />
        </ListItem>
        <ListItem>
          <span>{labels.isBlocked}</span>
          <Toggle color="blue" checked={isBlocked} onToggleChange={() => setIsBlocked(!isBlocked)} />
        </ListItem>
        <ListItem>
          <span>{labels.exceedPrice}</span>
          <Toggle color="blue" checked={exceedPrice} onToggleChange={() => setExceedPrice(!exceedPrice)} />
        </ListItem>
        <ListInput 
          name="deliveryFees" 
          label={labels.deliveryFees}
          value={deliveryFees}
          floatingLabel 
          clearButton
          type="number" 
          onChange={e => setDeliveryFees(e.target.value)}
          onInputClear={() => setDeliveryFees('')}
        />
        <ListItem
          title={labels.deliveryInterval}
          smartSelect
          smartSelectParams={{
            openIn: "popup", 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close
          }}
        >
          <select name="deliveryInterval" value={deliveryInterval} onChange={e => setDeliveryInterval(e.target.value)}>
            <option value=""></option>
            {deliveryIntervals.map(i => 
              <option key={i.id} value={i.id}>{i.name}</option>
            )}
          </select>
        </ListItem>
        <ListInput 
          name="orderLimit" 
          label={labels.orderLimit}
          value={orderLimit}
          floatingLabel 
          clearButton
          type="number" 
          onChange={e => setOrderLimit(e.target.value)}
          onInputClear={() => setOrderLimit('')}
        />
        <ListInput
          label={labels.otherMobile}
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
        <ListInput 
          name="position" 
          label={labels.position}
          value={position}
          floatingLabel 
          clearButton
          type="text" 
          onChange={e => setPosition(e.target.value)}
          onInputClear={() => setPosition('')}
        />
        <ListInput 
          name="address" 
          label={labels.address}
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
