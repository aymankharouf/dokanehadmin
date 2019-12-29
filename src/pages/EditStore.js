import React, { useState, useContext, useEffect, useMemo } from 'react'
import { editStore, showMessage, showError, getMessage } from '../data/actions'
import { Page, Navbar, List, ListItem, ListInput, Fab, Icon, Toolbar, Toggle } from 'framework7-react'
import { StoreContext } from '../data/store'
import BottomToolbar from './BottomToolbar'
import labels from '../data/labels'
import { storeTypes } from '../data/config'

const EditStore = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const store = useMemo(() => state.stores.find(s => s.id === props.id)
  , [state.stores, props.id])
  const storeOwners = useMemo(() => state.customers.filter(c => c.storeId === props.id)
  , [state.customers, props.id])
  const [type, setType] = useState(store.type)
  const [name, setName] = useState(store.name)
  const [mobile, setMobile] = useState(store.mobile)
  const [mobileErrorMessage, setMobileErrorMessage] = useState('')
  const [address, setAddress] = useState(store.address)
  const [discount, setDiscount] = useState(store.discount)
  const [locationId, setLocationId] = useState(store.locationId)
  const [position, setPosition] = useState(store.position)
  const [canReturn, setCanReturn] = useState(store.canReturn)
  const locations = useMemo(() => [...state.locations].sort((l1, l2) => l1.sorting - l2.sorting)
  , [state.locations])

  useEffect(() => {
    const patterns = {
      mobile: /^07[7-9][0-9]{7}$/
    }
    const validateMobile = (value) => {
      if (patterns.mobile.test(value)){
        setMobileErrorMessage('')
      } else {
        setMobileErrorMessage(labels.invalidMobile)
      }
    }
    if (mobile) validateMobile(mobile)
    else setMobileErrorMessage('')
  }, [mobile])
  const hasChanged = useMemo(() => {
    if (name !== store.name) return true
    if (mobile !== store.mobile) return true
    if (discount !== store.discount) return true
    if (address !== store.address) return true
    if (locationId !== store.locationId) return true
    if (position !== store.position) return true
    if (canReturn !== store.canReturn) return true
    return false
  }, [store, name, mobile, discount, address, locationId, position, canReturn])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])

  const handleSubmit = async () => {
    try{
      if (discount && discount <= 0) {
        throw new Error('invalidValue')
      }
      await editStore({
        id: store.id,
        name,
        type,
        discount,
        canReturn,
        mobile,
        locationId,
        address,
        position
      })
      showMessage(labels.editSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  return (
    <Page>
      <Navbar title={labels.editStore} backLink={labels.back} />
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
        <ListInput
          name="mobile"
          label={labels.mobile}
          value={mobile}
          floatingLabel
          clearButton
          type="number"
          errorMessage={mobileErrorMessage}
          errorMessageForce
          onChange={e => setMobile(e.target.value)}
          onInputClear={() => setMobile('')}
        />
        <ListItem
          title={labels.type}
          smartSelect
          smartSelectParams={{
            openIn: "popup", 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close
          }}
        >
          <select name="type" value={type} onChange={e => setType(e.target.value)}>
            <option value=""></option>
            {storeTypes.map(t => 
              t.id === '1' ? '' : <option key={t.id} value={t.id}>{t.name}</option>
            )}
          </select>
        </ListItem>
        <ListInput
          name="discount"
          label={labels.discount}
          value={discount}
          floatingLabel
          clearButton
          type="number"
          onChange={e => setDiscount(e.target.value)}
          onInputClear={() => setDiscount('')}
        />
        <ListItem>
          <span>{labels.canReturn}</span>
          <Toggle 
            name="canReturn" 
            color="green" 
            checked={canReturn} 
            onToggleChange={() => setCanReturn(!canReturn)}
          />
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
          type="textarea" 
          onChange={e => setAddress(e.target.value)}
          onInputClear={() => setAddress('')}
        />
        <ListItem
          link={`/storeOwners/${store.id}`}
          title={labels.storeOwners}
          after={storeOwners.length}
        />
      </List>
      {!name || !type || !locationId || mobileErrorMessage || !hasChanged ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}
export default EditStore
