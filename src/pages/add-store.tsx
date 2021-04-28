import { useState, useEffect, useContext } from 'react'
import { addStore, showMessage, showError, getMessage } from '../data/actions'
import { f7, Page, Navbar, List, ListItem, ListInput, Fab, Icon, Toggle, ListButton } from 'framework7-react'
import labels from '../data/labels'
import { StateContext } from '../data/state-provider'

const AddStore = () => {
  const { state } = useContext(StateContext)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [mobileErrorMessage, setMobileErrorMessage] = useState('')
  const [address, setAddress] = useState('')
  const [isActive, setIsActive] = useState(false)
  const [locationId, setLocationId] = useState('')
  const [locations] = useState(() => [...state.locations].sort((l1, l2) => l1.ordering - l2.ordering))
  const [position, setPosition] = useState({lat: 0, lng: 0})
  useEffect(() => {
    const patterns = {
      mobile: /^07[7-9][0-9]{7}$/
    }
    const validateMobile = (value: string) => {
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
  const handleSetPosition = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => null
    );
  }
  const handleSubmit = () => {
    try{
      const store = {
        name,
        mobile,
        isActive,
        locationId,
        address,
        position,
        time: new Date()
      }
      addStore(store)
      showMessage(labels.addSuccess)
      f7.views.current.router.back()
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  return (
    <Page>
      <Navbar title={labels.newStore} backLink={labels.back} />
      <List form inlineLabels>
        <ListInput 
          name="name" 
          label={labels.name}
          value={name}
          clearButton 
          autofocus
          type="text" 
          onChange={e => setName(e.target.value)}
          onInputClear={() => setName('')}
        />
        <ListInput
          name="mobile"
          label={labels.mobile}
          value={mobile}
          clearButton
          type="number"
          errorMessage={mobileErrorMessage}
          errorMessageForce
          onChange={e => setMobile(e.target.value)}
          onInputClear={() => setMobile('')}
        />
        <ListItem>
          <span>{labels.isActive}</span>
          <Toggle 
            name="isActive" 
            color="green" 
            checked={isActive} 
            onToggleChange={() => setIsActive(!isActive)}
          />
        </ListItem>
        <ListItem 
          title={labels.location}
          smartSelect
          // @ts-ignore
          smartSelectParams={{
            // el: "#locations", 
            openIn: "popup",
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close,
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
          value={address}
          clearButton 
          type="textarea" 
          onChange={e => setAddress(e.target.value)}
          onInputClear={() => setAddress('')}
        />
        <ListButton 
          title={labels.setPosition} 
          onClick={handleSetPosition}
        />
      </List>
      {name && locationId && !mobileErrorMessage && position.lat &&
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default AddStore
