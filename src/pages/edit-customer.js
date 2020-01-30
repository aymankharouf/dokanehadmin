import React, { useState, useContext, useEffect } from 'react'
import { f7, Page, Navbar, List, ListInput, Fab, Icon, Toolbar, ListItem, Toggle } from 'framework7-react'
import { StoreContext } from '../data/store'
import BottomToolbar from './bottom-toolbar'
import { editCustomer, showMessage, showError, getMessage } from '../data/actions'
import labels from '../data/labels'
import { deliveryIntervals } from '../data/config'

const EditCustomer = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [customer] = useState(() => state.customers.find(c => c.id === props.id))
  const [userInfo] = useState(() => state.users.find(u => u.id === props.id))
  const [name, setName] = useState(customer.name)
  const [address, setAddress] = useState(customer.address)
  const [locationId, setLocationId] = useState(customer.locationId)
  const [isOldAge, setIsOldAge] = useState(customer.isOldAge)
  const [mapPosition, setMapPosition] = useState(customer.mapPosition)
  const [otherMobile, setOtherMobile] = useState(customer.otherMobile)
  const [otherMobileErrorMessage, setOtherMobileErrorMessage] = useState('')
  const [isBlocked, setIsBlocked] = useState(customer.isBlocked)
  const [withDelivery, setWithDelivery] = useState(customer.withDelivery)
  const [exceedPrice, setExceedPrice] = useState(customer.exceedPrice)
  const [deliveryDiscount, setDeliveryDiscount] = useState((customer.deliveryDiscount / 1000).toFixed(3))
  const [orderLimit, setOrderLimit] = useState((customer.orderLimit / 1000).toFixed(3))
  const [deliveryInterval, setDeliveryInterval] = useState(customer.deliveryInterval)
  const [hasChanged, setHasChanged] = useState(false)
  const [locations] = useState(() => [...state.locations].sort((l1, l2) => l1.name > l2.name ? 1 : -1))
  useEffect(() => {
    if (name !== customer.name
    || address !== customer.address
    || locationId !== customer.locationId
    || isOldAge !== customer.isOldAge
    || mapPosition !== customer.mapPosition
    || isBlocked !== customer.isBlocked
    || withDelivery !== customer.withDelivery
    || otherMobile !== customer.otherMobile
    || exceedPrice !== customer.exceedPrice
    || deliveryDiscount * 1000 !== customer.deliveryDiscount
    || orderLimit * 1000 !== customer.orderLimit
    || deliveryInterval !== customer.deliveryInterval) setHasChanged(true)
    else setHasChanged(false)
  }, [customer, name, address, locationId, isOldAge, mapPosition, isBlocked, withDelivery, otherMobile, exceedPrice, deliveryDiscount, orderLimit, deliveryInterval])
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
  useEffect(() => {
    if (inprocess) {
      f7.dialog.preloader(labels.inprocess)
    } else {
      f7.dialog.close()
    }
  }, [inprocess])

  const handleSubmit = async () => {
    try{
      const newCustomer = {
        id: props.id,
        name,
        address,
        locationId,
        isOldAge,
        mapPosition,
        isBlocked,
        otherMobile,
        exceedPrice,
        deliveryDiscount: deliveryDiscount * 1000,
        orderLimit: orderLimit * 1000,
        deliveryInterval,
        withDelivery
      }
      setInprocess(true)
      await editCustomer(newCustomer, userInfo.mobile, customer.storeId, state.stores)
      setInprocess(false)
      showMessage(labels.editSuccess)
      props.f7router.back()    
    } catch(err) {
      setInprocess(false)
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
          <span>{labels.withDelivery}</span>
          <Toggle color="blue" checked={withDelivery} onToggleChange={() => setWithDelivery(!withDelivery)} />
        </ListItem>
        <ListItem>
          <span>{labels.exceedPrice}</span>
          <Toggle color="blue" checked={exceedPrice} onToggleChange={() => setExceedPrice(!exceedPrice)} />
        </ListItem>
        <ListInput 
          name="deliveryFees" 
          label={labels.deliveryDiscount}
          value={deliveryDiscount}
          floatingLabel 
          clearButton
          type="number" 
          onChange={e => setDeliveryDiscount(e.target.value)}
          onInputClear={() => setDeliveryDiscount('')}
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
          name="mapPosition" 
          label={labels.mapPosition}
          value={mapPosition}
          floatingLabel 
          clearButton
          type="text" 
          onChange={e => setMapPosition(e.target.value)}
          onInputClear={() => setMapPosition('')}
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
