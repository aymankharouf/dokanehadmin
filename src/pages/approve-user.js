import React, { useState, useContext, useMemo, useEffect } from 'react'
import { Page, Navbar, List, ListInput, Fab, Icon, Toolbar, ListItem } from 'framework7-react'
import { StoreContext } from '../data/store'
import BottomToolbar from './bottom-toolbar'
import { approveUser, showMessage, showError, getMessage } from '../data/actions'
import labels from '../data/labels'

const ApproveUser = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const userInfo = useMemo(() => state.users.find(u => u.id === props.id)
  , [state.users, props.id])
  const [name, setName] = useState(userInfo.name)
  const [locationId, setLocationId] = useState('')
  const [address, setAddress] = useState('')
  const [storeId, setStoreId] = useState('')
  const [otherMobile, setOtherMobile] = useState('')
  const [otherMobileErrorMessage, setOtherMobileErrorMessage] = useState('')
  const stores = useMemo(() => {
    const stores = state.stores.filter(s => s.id !== 's')
    return stores.sort((s1, s2) => s1.name > s2.name ? 1 : -1)
  }, [state.stores]) 
  const locations = useMemo(() => [...state.locations].sort((l1, l2) => l1.ordering - l2.ordering)
  , [state.locations])

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
    try {
      if (otherMobile === userInfo.mobile) {
        throw new Error('sameMobile')
      }
      if (otherMobile && state.users.find(u => u.mobile === otherMobile)) {
        throw new Error('otherUserMobile')
      }
      if (otherMobile && state.customers.find(c => c.otherMobile === otherMobile)) {
        throw new Error('otherUserMobile')
      }
      const storeName = storeId ? state.stores.find(s => s.id === storeId).name : ''
      await approveUser({
        id: props.id,
        mobile: userInfo.mobile,
        name,
        storeId,
        locationId,
        otherMobile,
        address,
        storeName
      })
      showMessage(labels.approveSuccess)
      props.f7router.back()  
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  return (
    <Page>
      <Navbar title={labels.approveUser} backLink={labels.back} />
      <List form>
        <ListInput 
          name="name" 
          label={labels.name}
          floatingLabel 
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <ListInput 
          name="mobile" 
          label={labels.mobile}
          type="number"
          value={userInfo.mobile}
          readonly
        />
        <ListInput 
          name="storeName" 
          label={labels.storeName}
          type="text"
          value={userInfo.storeName || ''}
          readonly
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
          name="address" 
          label={labels.address}
          floatingLabel 
          type="text" 
          value={address}
          onChange={e => setAddress(e.target.value)}
        />
      </List>
      {!name || (userInfo.storeName && !storeId) || !locationId ? '' :
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
export default ApproveUser
