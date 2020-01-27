import React, { useState, useContext, useEffect } from 'react'
import { editStore, showMessage, showError, getMessage } from '../data/actions'
import { f7, Page, Navbar, List, ListItem, ListInput, Fab, Icon, Toolbar, Toggle } from 'framework7-react'
import { StoreContext } from '../data/store'
import BottomToolbar from './bottom-toolbar'
import labels from '../data/labels'
import { storeTypes } from '../data/config'

const EditStore = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [store] = useState(() => state.stores.find(s => s.id === props.id))
  const [storeOwners, setStoreOwners] = useState([])
  const [type, setType] = useState('')
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [mobileErrorMessage, setMobileErrorMessage] = useState('')
  const [address, setAddress] = useState('')
  const [discount, setDiscount] = useState('')
  const [locationId, setLocationId] = useState('')
  const [mapPosition, setMapPosition] = useState('')
  const [allowReturn, setAllowReturn] = useState('')
  const [openTime, setOpenTime] = useState('')
  const [hasChanged, setHasChanged] = useState(false)
  const [locations] = useState(() => [...state.locations].sort((l1, l2) => l1.ordering - l2.ordering))
  useEffect(() => {
    setStoreOwners(() => state.customers.filter(c => c.storeId === props.id))
  }, [state.customers, props.id])
  useEffect(() => {
    setType(store.type)
    setName(store.name)
    setMobile(store.mobile)
    setAddress(store.address)
    setDiscount(store.discount * 100)
    setLocationId(store.locationId)
    setMapPosition(store.mapPosition)
    setAllowReturn(store.allowReturn)
    setOpenTime(store.openTime)
  }, [store])
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
  useEffect(() => {
    if (name !== store.name
    || mobile !== store.mobile
    || discount !== store.discount * 100
    || address !== store.address
    || locationId !== store.locationId
    || mapPosition !== store.mapPosition
    || allowReturn !== store.allowReturn
    || openTime !== store.openTime) setHasChanged(true)
    else setHasChanged(false)
  }, [store, name, mobile, discount, address, locationId, mapPosition, allowReturn, openTime])
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
      if (discount && discount <= 0) {
        throw new Error('invalidValue')
      }
      setInprocess(true)
      await editStore({
        id: store.id,
        name,
        type,
        discount: discount / 100,
        allowReturn,
        mobile,
        locationId,
        address,
        mapPosition,
        openTime
      })
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
          <span>{labels.allowReturn}</span>
          <Toggle 
            name="allowReturn" 
            color="green" 
            checked={allowReturn} 
            onToggleChange={() => setAllowReturn(!allowReturn)}
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
          name="openTime"
          label={labels.openTime}
          value={openTime}
          floatingLabel
          clearButton
          type="text"
          onChange={e => setOpenTime(e.target.value)}
          onInputClear={() => setOpenTime('')}
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
          type="textarea" 
          onChange={e => setAddress(e.target.value)}
          onInputClear={() => setAddress('')}
        />
        <ListItem
          link={`/store-owners/${store.id}`}
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
