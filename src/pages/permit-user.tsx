import {useContext, useState, useEffect} from 'react'
import {f7, Page, Navbar, List, ListInput, Fab, Icon, ListItem} from 'framework7-react'
import {permitUser, showMessage, showError, getMessage} from '../data/actions'
import labels from '../data/labels'
import {StateContext} from '../data/state-provider'

type Props = {
  id: string
}
const PermitUser = (props: Props) => {
  const {state} = useContext(StateContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [user] = useState(() => state.users.find(u => u.id === props.id)!)
  const [address, setAddress] = useState(user.address || '')
  const [locationId, setLocationId] = useState('')
  const [locations] = useState(() => [...state.locations].sort((l1, l2) => l1.name > l2.name ? 1 : -1))
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
  const handlePermit = () => {
    try{
      setInprocess(true)
      permitUser(user, locationId, address)
      setInprocess(false)
      showMessage(labels.permitSuccess)
      f7.views.current.router.back()
    } catch (err){
      setInprocess(false)
      setError(getMessage(f7.views.current.router.currentRoute.path, err))
    }
  }

  return (
    <Page>
      <Navbar title={labels.permitUser} backLink={labels.back} />
      <List form>
        <ListInput 
          name="user" 
          label={labels.user}
          type="text" 
          value={user.name}
          readonly
        />
        <ListInput 
          name="store" 
          label={labels.storeName}
          type="text" 
          value={user.storeName}
          readonly
        />
        <ListInput 
          name="mobile" 
          label={labels.mobile}
          type="text" 
          value={user.mobile}
          readonly
        />
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
      </List>
      {address && locationId &&
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={handlePermit}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default PermitUser
