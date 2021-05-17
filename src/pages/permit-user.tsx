import {useContext, useState, useEffect} from 'react'
import {f7, Page, Navbar, List, ListInput, Fab, Icon, ListItem} from 'framework7-react'
import {permitUser, getMessage} from '../data/actions'
import labels from '../data/labels'
import {StateContext} from '../data/state-provider'
import { storeTypes } from '../data/config'
import { useHistory, useLocation, useParams } from 'react-router'
import { useIonLoading, useIonToast } from '@ionic/react'

type Params = {
  id: string
}
const PermitUser = () => {
  const {state} = useContext(StateContext)
  const params = useParams<Params>()
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [loading, dismiss] = useIonLoading()
  const [user] = useState(() => state.users.find(u => u.id === params.id)!)
  const [storeName, setStoreName] = useState(user.storeName || '')
  const [address, setAddress] = useState(user.address || '')
  const [locationId, setLocationId] = useState('')
  const [type, setType] = useState('')
  const [locations] = useState(() => [...state.locations].sort((l1, l2) => l1.name > l2.name ? 1 : -1))
  const handlePermit = () => {
    try{
      loading()
      permitUser(user, type, storeName, locationId, address)
      dismiss()
      message(labels.permitSuccess, 3000)
      history.goBack()
    } catch (err){
      dismiss()
      message(getMessage(location.pathname, err), 3000)
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
          name="mobile" 
          label={labels.mobile}
          type="text" 
          value={user.mobile}
          readonly
        />
        {user.type !== 'n' && 
          <ListInput 
            name="name" 
            label={labels.storeName}
            value={storeName}
            clearButton 
            type="text" 
            onChange={e => setStoreName(e.target.value)}
            onInputClear={() => setStoreName('')} 
          />
        }
        {user.type !== 'n' && 
          <ListItem 
            title={labels.type}
            smartSelect
            // @ts-ignore
            smartSelectParams={{
              // el: "#locations", 
              openIn: "sheet",
              closeOnSelect: true, 
            }}
          >
            <select name="type" value={type} onChange={e => setType(e.target.value)}>
              <option value=""></option>
              {storeTypes.map(t => 
                <option key={t.id} value={t.id}>{t.name}</option>
              )}
            </select>
          </ListItem>
        }
        {type !== 'd' &&
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
        }
        {type !== 'd' &&
          <ListInput 
            name="address" 
            label={labels.address}
            value={address}
            clearButton 
            type="textarea" 
            onChange={e => setAddress(e.target.value)}
            onInputClear={() => setAddress('')}
          />
        }
      </List>
      {(address || type === 'd' || user.type === 'n') && (type || user.type === 'n') && (locationId || type === 'd') && (storeName || user.type === 'n') &&
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={handlePermit}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default PermitUser
