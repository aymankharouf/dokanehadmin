import React, { useState, useContext, useEffect, useMemo } from 'react'
import { editStore, showMessage, showError, getMessage } from '../data/Actions'
import { Page, Navbar, List, ListItem, ListInput, Fab, Icon, Toolbar } from 'framework7-react';
import { StoreContext } from '../data/Store';
import BottomToolbar from './BottomToolbar';


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
  const [discount, setDiscount] = useState('')
  const [locationId, setLocationId] = useState('')

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
  }, [mobile, state.labels])
  useEffect(() => {
    if (error) {
      showError(props, error)
      setError('')
    }
  }, [error, props])

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
          mobile,
          locationId,
            address
        })
      showMessage(props, state.labels.editSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(err, state.labels, props.f7route.route.component.name))
		}
  }
  return (
    <Page>
      <Navbar title={state.labels.editStore} backLink={state.labels.back} />
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
            <option value=""></option>
            {state.storeTypes.map(t => t.id === '1' ? '' : 
              <option key={t.id} value={t.id}>{t.name}</option>
            )}
          </select>
          <ListInput
          name="discount"
          label={state.labels.discount}
          value={discount}
          floatingLabel
          clearButton
          type="number"
          onChange={e => setDiscount(e.target.value)}
          onInputClear={() => setDiscount('')}
        />
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
            {state.locations.map(l => 
              <option key={l.id} value={l.id}>{l.name}</option>
            )}
          </select>
        </ListItem>
        </ListItem>
        <ListInput 
          name="address" 
          label={state.labels.address}
          value={address}
          floatingLabel
          clearButton 
          type="textarea" 
          onChange={e => setAddress(e.target.value)}
          onInputClear={() => setAddress('')}
        />
        <ListItem
          link={`/storeOwners/${store.id}`}
          title={state.labels.storeOwners}
          after={storeOwners.length}
        />
      </List>
      {!name || !type || mobileErrorMessage || (name === store.name && type === store.type && mobile === store.mobile && address === store.address) ? ''
      : <Fab position="left-top" slot="fixed" color="green" onClick={() => handleSubmit()}>
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
