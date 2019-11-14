import React, { useState, useContext, useEffect, useMemo } from 'react'
import { editStore, showMessage } from '../data/Actions'
import { Page, Navbar, List, ListItem, ListInput, Fab, Icon, Toolbar } from 'framework7-react';
import { StoreContext } from '../data/Store';
import BottomToolbar from './BottomToolbar';


const EditStore = props => {
  const { state } = useContext(StoreContext)
  const store = useMemo(() => state.stores.find(rec => rec.id === props.id)
  , [state.stores, props.id])
  const storeOwners = useMemo(() => state.customers.filter(rec => rec.storeId === props.id)
  , [state.customers, props.id])
  const [type, setType] = useState(store.type)
  const [name, setName] = useState(store.name)
  const [mobile, setMobile] = useState(store.mobile)
  const [mobileErrorMessage, setMobileErrorMessage] = useState('')
  const [address, setAddress] = useState(store.address)

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

  const handleSubmit = () => {
    editStore({
      id: store.id,
      name,
      type,
      mobile,
      address
    }).then(() => {
      showMessage(props, 'success', state.labels.editSuccess)
      props.f7router.back()
    })
  }
  const storeTypesTags = useMemo(() => state.storeTypes.map(rec => 
    rec.id === '1' ? '' : <option key={rec.id} value={rec.id}>{rec.name}</option>
  ), [state.storeTypes])
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
            {storeTypesTags}
          </select>
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
