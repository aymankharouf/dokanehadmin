import React, { useState, useContext, useEffect, useMemo } from 'react'
import { editStore, showMessage } from '../data/Actions'
import {Page, Navbar, List, ListItem, ListInput, Fab, Icon, Toggle } from 'framework7-react';
import { StoreContext } from '../data/Store';


const EditStore = props => {
  const { state } = useContext(StoreContext)
  const store = useMemo(() => state.stores.find(rec => rec.id === props.id), [state.stores])
  const [type, setType] = useState(store.type)
  const [name, setName] = useState(store.name)
  const [mobile, setMobile] = useState(store.mobile)
  const [mobileErrorMessage, setMobileErrorMessage] = useState('')
  const [address, setAddress] = useState(store.address)
  const [isActive, setIsActive] = useState(store.isActive || false)
  const [error, setError] = useState('')

  useEffect(() => {
    const patterns = {
      mobile: /^07[7-9][0-9]{7}$/
    }
    const validateMobile = (value) => {
      if (patterns.mobile.test(value)){
        setMobileErrorMessage('')
      } else {
        setMobileErrorMessage(state.labels.invalidMobile)
      }
    }
    if (mobile) validateMobile(mobile)
    else setMobileErrorMessage('')
  }, [mobile])

  const handleSubmit = () => {
    editStore({
      id: store.id,
      name,
      type,
      mobile,
      address,
      isActive
    }).then(() => {
      showMessage(props, 'success', state.labels.editSuccess)
      props.f7router.back()
    })
  }
  const storeTypesTags = useMemo(() => state.storeTypes.map(rec => 
    <option key={rec.id} value={rec.id}>{rec.name}</option>
  ), [state.storeTypes])
  return (
    <Page>
      <Navbar title={state.labels.editStore} backLink={state.labels.back} />
      <List form>
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
          <select name='type' value={type} onChange={(e) => setType(e.target.value)}>
            <option value="" disabled></option>
            {storeTypesTags}
          </select>
        </ListItem>
        <ListInput 
          name="name" 
          label={state.labels.name}
          value={name}
          floatingLabel
          clearButton 
          type="text" 
          onChange={(e) => setName(e.target.value)}
          onInputClear={() => setName('')}
        />
        <ListItem>
          <span>{state.labels.isActive}</span>
          <Toggle name="isActive" color="green" checked={isActive} onToggleChange={() => setIsActive(!isActive)}/>
        </ListItem>
        <ListInput
          label={state.labels.mobile}
          type="text"
          placeholder={state.labels.mobilePlaceholder}
          name="mobile"
          clearButton
          value={mobile}
          errorMessage={mobileErrorMessage}
          errorMessageForce
          onChange={(e) => setMobile(e.target.value)}
          onInputClear={() => setMobile('')}
        />
        <ListInput 
          name="address" 
          label={state.labels.address}
          value={address}
          floatingLabel
          clearButton 
          type="textarea" 
          onChange={(e) => setAddress(e.target.value)}
          onInputClear={() => setAddress('')}
        />
      </List>
      {!name || !type || mobileErrorMessage || (name === store.name && type === store.type && mobile === store.mobile && address === store.address && isActive === store.isActive) ? ''
      : <Fab position="left-top" slot="fixed" color="green" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default EditStore
