import React, { useContext, useState, useEffect, useMemo } from 'react'
import { f7, Page, Navbar, List, ListItem, Button } from 'framework7-react'
import { permitUser, showMessage, showError, getMessage } from '../data/actions'
import labels from '../data/labels'
import { StoreContext } from '../data/store'
import { orderPositions } from '../data/config'

const PermitUser = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [userId, setUserId] = useState('')
  const [position, setPosition] = useState('')
  const users = useMemo(() => [...state.users].sort((u1, u2) => u1.name > u2.name ? 1 : -1)
  , [state.users])
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
  useEffect(() => {
    if (userId) {
      setPosition(state.users.find(u => u.id === userId).permissionType || '')
    } else {
      setPosition('')
    }
  }, [userId, state.users])
  const handlePermit = async () => {
    try{
      setInprocess(true)
      await permitUser(userId, position, state.users)
      setInprocess(false)
      showMessage(labels.registerSuccess)
      props.f7router.back()
    } catch (err){
      setInprocess(false)
      setError(getMessage(props, err))
    }
  }

  return (
    <Page>
      <Navbar title={labels.permitUser} backLink={labels.back} />
      <List form>
        <ListItem
          title={labels.user}
          smartSelect
          smartSelectParams={{
            openIn: "popup", 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close
          }}
        >
          <select name="userId" value={userId} onChange={e => setUserId(e.target.value)}>
            <option value=""></option>
            {users.map(u => 
              <option key={u.id} value={u.id}>{`${u.name}: ${u.mobile}`}</option>
            )}
          </select>
        </ListItem>
        <ListItem
          title={labels.position}
          smartSelect
          smartSelectParams={{
            openIn: "popup", 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close
          }}
        >
          <select name="position" value={position} onChange={e => setPosition(e.target.value)}>
            <option value=""></option>
            {orderPositions.map(p => 
              <option key={p.id} value={p.id}>{p.name}</option>
            )}
          </select>
        </ListItem>
      </List>
      {!userId ? '' :
        <Button text={labels.permit} href="#" large onClick={() => handlePermit()} />
      }
    </Page>
  )
}
export default PermitUser
