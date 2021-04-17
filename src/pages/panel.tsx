import { useContext, useState, useEffect } from 'react'
import { f7, Page, Navbar, List, ListItem } from 'framework7-react'
import { StoreContext } from '../data/store'
import { logout } from '../data/actions'
import labels from '../data/labels'

const Panel = () => {
  const { state, dispatch } = useContext(StoreContext)
  const [approvalsCount, setApprovalsAcount] = useState('')
  useEffect(() => {
    const newUsers = state.users.filter((u: any) => !state.customers.find((c: any) => c.id === u.id)).length
    const alarms = state.alarms.filter((a: any) => a.status === 'n').length
    const ratings = state.ratings.filter((r: any) => r.status === 'n').length
    const invitations = state.invitations.filter((i: any) => i.status === 'n').length
    const passwordRequests = state.passwordRequests.length
    const newStoresOwners = state.customers.filter((c: any) => c.storeName && !c.storeId).length
    const notifyFriends = state.users.filter((u: any) => u.notifyFriends?.length > 0).length
    setApprovalsAcount(newUsers + alarms + ratings + invitations + passwordRequests + newStoresOwners + notifyFriends)
  }, [state.users, state.customers, state.passwordRequests, state.alarms, state.ratings, state.invitations])
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
