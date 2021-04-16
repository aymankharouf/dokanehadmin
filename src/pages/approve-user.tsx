import { useState, useContext, useEffect } from 'react'
import { f7, Page, Navbar, List, ListInput, Fab, Icon, ListItem, FabBackdrop, FabButton, FabButtons, Toolbar } from 'framework7-react'
import { StoreContext } from '../data/store'
import Footer from './footer'
import { approveUser, deleteUser, showMessage, showError, getMessage } from '../data/actions'
import labels from '../data/labels'

const ApproveUser = (props: any) => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [userInfo] = useState(() => state.users.find((u: any) => u.id === props.id))
  const [name, setName] = useState(userInfo.name)
  const [locationId, setLocationId] = useState(userInfo.locationId)
  const [storeId, setStoreId] = useState('')
  const [locations] = useState(() => [...state.locations].sort((l1, l2) => l1.ordering - l2.ordering))
  const [stores] = useState(() => [...state.stores].sort((s1, s2) => s1.name > s2.name ? 1 : -1))
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
  const handleSubmit = () => {
    try {
      approveUser(props.id, name, userInfo.mobile, locationId, storeId || '', state.users)
      showMessage(labels.approveSuccess)
      f7.views.current.router.back()  
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  const handleDelete = () => {
    f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, async () => {
      try{
        setInprocess(true)
        await deleteUser(userInfo)
        setInprocess(false)
        showMessage(labels.deleteSuccess)
        f7.views.current.router.back()
      } catch(err) {
        setInprocess(false)
        setError(getMessage(f7.views.current.router.currentRoute.path, err))
      }
    })
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
        {userInfo.storeName && <ListInput 
          name="storeName" 
          label={labels.storeName}
          type="text"
          value={userInfo.storeName}
          readonly
        />}
        <ListItem
          title={labels.location}
          smartSelect
          id="locations"
          smartSelectParams={{
            el: "#locations",
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
        {userInfo.storeName && <ListItem
          title={labels.store}
          smartSelect
          id="stores"
          smartSelectParams={{
            el: "#stores",
            openIn: "popup", 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close
          }}
        >
          <select name="storeId" value={storeId} onChange={e => setStoreId(e.target.value)}>
            <option value=""></option>
            {stores.map(s => 
              <option key={s.id} value={s.id}>{s.name}</option>
            )}
          </select>
        </ListItem>}
      </List>
      <FabBackdrop slot="fixed" />
      <Fab position="left-top" slot="fixed" color="orange" className="top-fab">
        <Icon material="keyboard_arrow_down"></Icon>
        <Icon material="close"></Icon>
        <FabButtons position="bottom">
          {!name || !locationId ? '' :
            <FabButton color="green" onClick={() => handleSubmit()}>
              <Icon material="done"></Icon>
            </FabButton>
          }
          <FabButton color="red" onClick={() => handleDelete()}>
            <Icon material="delete"></Icon>
          </FabButton>
        </FabButtons>
      </Fab>
      <Toolbar bottom>
        <Footer/>
      </Toolbar>
    </Page>
  )
}
export default ApproveUser
