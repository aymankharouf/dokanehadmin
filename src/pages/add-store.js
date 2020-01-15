import React, { useState, useContext, useEffect, useMemo } from 'react'
import { addStore, showMessage, showError, getMessage } from '../data/actions'
import { f7, Page, Navbar, List, ListItem, ListInput, Fab, Icon, Toolbar, Toggle } from 'framework7-react'
import { StoreContext } from '../data/store'
import BottomToolbar from './bottom-toolbar'
import labels from '../data/labels'
import { storeTypes } from '../data/config'

const AddStore = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [type, setType] = useState('')
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [mobileErrorMessage, setMobileErrorMessage] = useState('')
  const [address, setAddress] = useState('')
  const [discount, setDiscount] = useState('')
  const [locationId, setLocationId] = useState('')
  const [position, setPosition] = useState('')
  const [canReturn, setCanReturn] = useState(false)
  const locations = useMemo(() => [...state.locations].sort((l1, l2) => l1.ordering - l2.ordering)
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
    if (discount && discount <= 0) {
      throw new Error('invalidValue')
    }
    try{
      setInprocess(true)
      await addStore({
        name,
        type,
        discount,
        mobile,
        locationId,
        position,
        canReturn,
        address
      })
      setInprocess(false)
      showMessage(labels.addSuccess)
      props.f7router.back()
    } catch(err) {
      setInprocess(false)
			setError(getMessage(props, err))
		}
  }
  return (
    <Page>
      <Navbar title={labels.newStore} backLink={labels.back} />
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
      </List>
      {!name || !type || !locationId || mobileErrorMessage ? '' :
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
export default AddStore
