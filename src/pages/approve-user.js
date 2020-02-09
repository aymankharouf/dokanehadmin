import React, { useState, useContext, useEffect } from 'react'
import { f7, Page, Navbar, List, ListInput, Fab, Icon, Toolbar, ListItem } from 'framework7-react'
import { StoreContext } from '../data/store'
import BottomToolbar from './bottom-toolbar'
import { approveUser, showMessage, showError, getMessage } from '../data/actions'
import labels from '../data/labels'

const ApproveUser = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [userInfo] = useState(() => state.users.find(u => u.id === props.id))
  const [name, setName] = useState(userInfo.name)
  const [locationId, setLocationId] = useState(userInfo.locationId)
  const [address, setAddress] = useState('')
  const [otherMobile, setOtherMobile] = useState('')
  const [otherMobileErrorMessage, setOtherMobileErrorMessage] = useState('')
  const [locations] = useState(() => {
    const locations = state.lookups.find(l => l.id === 'l').values.slice()
    return locations.sort((l1, l2) => l1.ordering - l2.ordering)
  })
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
      setInprocess(true)
      await approveUser(props.id, name, userInfo.mobile, locationId, otherMobile, userInfo.storeName || '', address)
      setInprocess(false)
      showMessage(labels.approveSuccess)
      props.f7router.back()  
    } catch(err) {
      setInprocess(false)
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
      {!name || !locationId ? '' :
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
