import {useContext, useState, useEffect} from 'react'
import {f7, Page, Navbar, List, ListItem} from 'framework7-react'
import {StateContext} from '../data/state-provider'
import {logout} from '../data/actions'
import labels from '../data/labels'

const Panel = () => {
  const {state, dispatch} = useContext(StateContext)
  const [approvalsCount, setApprovalsAcount] = useState(0)
  useEffect(() => {
    const passwordRequests = state.passwordRequests.length
    const productRequests = state.productRequests.length
    const newUsers = state.users.filter(u => (u.storeName && !u.storeId) || (!u.storeName && !u.position.lat && !u.locationId)).length
    setApprovalsAcount(passwordRequests + productRequests + newUsers)
  }, [state.users, state.passwordRequests, state.productRequests])
  const handleLogout = () => {
    logout()
    f7.views.main.router.navigate('/home/', {reloadAll: true})
    f7.panel.close('right') 
    dispatch({type: 'CLEAR_BASKET'})
  }

  return(
    <Page>
      <Navbar title={labels.mainPanelTitle} />
      <List>
        {state.user ? <ListItem link="#" title={labels.logout} onClick={() => handleLogout()} />
        : <ListItem link="/panel-login/" title={labels.login} />}
        {state.user ? <ListItem link="/settings/" title={labels.settings} view="#main-view" panelClose /> : ''}
        {state.user ? <ListItem link="/approvals/" title={labels.approvals} badge={approvalsCount} badgeColor="red" view="#main-view" panelClose /> : ''}
        {state.user ? <ListItem link="/logs/" title={labels.logs} view="#main-view" panelClose /> : ''}
        {state.user ? <ListItem link="/users/o" title={labels.storesOwners} view="#main-view" panelClose /> : ''}
      </List>
    </Page>
  )
}
export default Panel
