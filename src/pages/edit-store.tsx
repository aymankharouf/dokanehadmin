import {useState, useContext, useEffect} from 'react'
import {f7, Page, Navbar, List, ListItem, ListInput, Fab, Icon, Toggle} from 'framework7-react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import {editStore, getMessage} from '../data/actions'
import { useHistory, useLocation, useParams } from 'react-router'
import { useIonToast } from '@ionic/react'

type Params = {
  id: string
}
const EditStore = () => {
  const {state} = useContext(StateContext)
  const params = useParams<Params>()
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [store] = useState(() => state.stores.find(s => s.id === params.id)!)
  const [name, setName] = useState(store.name)
  const [mobile, setMobile] = useState(store.mobile)
  const [mobileErrorMessage, setMobileErrorMessage] = useState('')
  const [address, setAddress] = useState(store.address)
  const [isActive, setIsActive] = useState(store.isActive)
  const [locationId, setLocationId] = useState(store.locationId)
  const [hasChanged, setHasChanged] = useState(false)
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
    if (name !== store.name
    || mobile !== store.mobile
    || address !== store.address
    || isActive !== store.isActive
    || locationId !== store.locationId) setHasChanged(true)
    else setHasChanged(false)
  }, [store, name, mobile, address, isActive, locationId])
  const handleSubmit = () => {
    try{
      const newStore = {
        ...store,
        name,
        isActive,
        mobile,
        address,
        locationId
      }
      editStore(newStore)
      message(labels.editSuccess, 3000)
      history.goBack()
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return (
    <Page>
      <Navbar title={labels.editStore} backLink={labels.back} />
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
            onToggleChange={() => setIsActive(s => !s)}
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
            renderPage: undefined
          }}
        >
          <select name="locationId" value={locationId} onChange={e => setLocationId(e.target.value)}>
            <option value=""></option>
            {state.locations.map(l => 
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
      </List>
      {name && !mobileErrorMessage && hasChanged &&
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default EditStore
