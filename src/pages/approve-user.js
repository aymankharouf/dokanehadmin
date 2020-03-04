import React, { useState, useContext, useEffect } from 'react'
import { Page, Navbar, List, ListInput, Fab, Icon, Toolbar, ListItem } from 'framework7-react'
import { StoreContext } from '../data/store'
import BottomToolbar from './bottom-toolbar'
import { approveUser, showMessage, showError, getMessage } from '../data/actions'
import labels from '../data/labels'

const ApproveUser = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [userInfo] = useState(() => state.users.find(u => u.id === props.id))
  const [name, setName] = useState(userInfo.name)
  const [locationId, setLocationId] = useState(userInfo.locationId)
  const [address, setAddress] = useState('')
  const [locations] = useState(() => [...state.locations].sort((l1, l2) => l1.ordering - l2.ordering))
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleSubmit = () => {
    try {
      approveUser(props.id, name, userInfo.mobile, locationId, userInfo.storeName || '', address, state.users)
      showMessage(labels.approveSuccess)
      props.f7router.back()  
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  return (
    <Page>
      <Navbar title={labels.approveUser} backLink={labels.back} />
      <List form inlineLabels>
        <ListInput 
          name="name" 
          label={labels.name}
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
          name="address" 
          label={labels.address}
          type="text" 
          clearButton
          value={address}
          onChange={e => setAddress(e.target.value)}
          onInputClear={() => setAddress('')}
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
