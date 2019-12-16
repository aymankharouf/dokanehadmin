import React, { useState, useContext, useMemo, useEffect } from 'react'
import { Page, Navbar, List, ListInput, Fab, Icon, Toolbar, ListItem } from 'framework7-react';
import { StoreContext } from '../data/Store';
import BottomToolbar from './BottomToolbar';
import { approveUser, showMessage, showError, getMessage } from '../data/Actions'


const ApproveUser = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const userInfo = useMemo(() => state.users.find(u => u.id === props.id)
  , [state.users, props.id])
  const [name, setName] = useState(userInfo.name)
  const [locationId, setLocationId] = useState(userInfo.locationId)
  const [address, setAddress] = useState('')
  const [storeId, setStoreId] = useState('')
  const [otherMobile, setOtherMobile] = useState('')
  const [otherMobileErrorMessage, setOtherMobileErrorMessage] = useState('')
  const [otherMobileHolder, setOtherMobileHolder] = useState('')
  const stores = useMemo(() => {
    const stores = state.stores.filter(s => s.id !== 's')
    return stores.sort((s1, s2) => s1.name > s2.name ? 1 : -1)
  }, [state.stores]) 
  const locations = useMemo(() => [...state.locations].sort((l1, l2) => l1.sorting - l2.sorting)
  , [state.locations])

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
      showError(props, error)
      setError('')
    }
  }, [error, props])

  const handleSubmit = async () => {
    try {
      if (otherMobile === userInfo.mobile) {
        throw new Error('sameMobile')
      }
      if (!otherMobile) setOtherMobileHolder('')
      await approveUser({
        id: props.id,
        name,
        storeId,
        locationId,
        otherMobile,
        otherMobileHolder,
        address,
      })
      showMessage(props, state.labels.approveSuccess)
      props.f7router.back()  
    } catch(err) {
			setError(getMessage(err, state.labels, props.f7route.route.component.name))
		}
  }
  return (
    <Page>
      <Navbar title={state.labels.approveUser} backLink={state.labels.back} />
      <List form>
        <ListInput 
          name="name" 
          label={state.labels.name}
          floatingLabel 
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <ListInput 
          name="mobile" 
          label={state.labels.mobile}
          floatingLabel 
          type="number"
          value={userInfo.mobile}
          readonly
        />
        <ListInput 
          name="storeName" 
          label={state.labels.storeName}
          floatingLabel 
          type="text"
          value={userInfo.storeName || ''}
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
          name="address" 
          label={state.labels.address}
          floatingLabel 
          type="text" 
          value={address}
          onChange={e => setAddress(e.target.value)}
        />
      </List>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
      {!name || (userInfo.storeName && !storeId) || !locationId ? '' :
        <Fab position="left-top" slot="fixed" color="green" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default ApproveUser
