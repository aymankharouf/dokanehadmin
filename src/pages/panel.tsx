import { useContext, useState, useEffect } from 'react'
import { f7, Page, Navbar, List, ListItem } from 'framework7-react'
import { StateContext } from '../data/state-provider'
import { logout } from '../data/actions'
import labels from '../data/labels'

const Panel = () => {
  const { state, dispatch } = useContext(StateContext)
  const [approvalsCount, setApprovalsAcount] = useState(0)
  useEffect(() => {
    const alarms = state.alarms.filter(a => a.status === 'n').length
    const ratings = state.ratings.filter(r => r.status === 'n').length
    const passwordRequests = state.passwordRequests.length
    const productRequests = state.productRequests.length
    const newStoresOwners = state.users.filter(u => u.storeName && !u.storeId).length
    setApprovalsAcount(alarms + ratings + passwordRequests + productRequests + newStoresOwners)
  }, [state.users, state.passwordRequests, state.productRequests, state.alarms, state.ratings])
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
        {state.user ? <ListItem link="/permission-list/s" title={labels.storesOwners} view="#main-view" panelClose /> : ''}
      </List>
    </Page>
  )
}
export default Panel
