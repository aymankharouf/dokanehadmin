import React, { useContext } from 'react'
import { Page, Navbar, List, ListItem } from 'framework7-react'
import { StoreContext } from '../data/store'
import { logout } from '../data/actions'
import labels from '../data/labels'

const Panel = props => {
  const { user, dispatch } = useContext(StoreContext)
  const handleLogout = () => {
    logout().then(() => {
      props.f7router.app.views.main.router.navigate('/home/', {reloadAll: true})
      props.f7router.app.panel.close('right') 
      dispatch({type: 'CLEAR_BASKET'})
    })
  }

  return(
    <Page>
      <Navbar title={labels.mainPanelTitle} />
      <List>
        {user ? 
          <ListItem 
            link="#" 
            title={labels.logout} 
            onClick={() => handleLogout()} 
          />
        :
          <ListItem 
            link="/panel-login/"
            title={labels.login}
          />
        }
        {user ? <ListItem link="/change-password/" title={labels.changePassword} /> : ''}
        {user ? <ListItem link="/settings/" title={labels.settings} view="#main-view" panelClose /> : ''}
        {user ? <ListItem link="/requested-packs/" title={labels.requestedPacks} view="#main-view" panelClose /> : ''}
        {user ? <ListItem link="/prepare-orders/" title={labels.prepareOrders} view="#main-view" panelClose /> : ''}
        {user ? <ListItem link="/followup-orders/" title={labels.followupOrders} view="#main-view" panelClose /> : ''}
        {user ? <ListItem link="/approvals/" title={labels.approvals} view="#main-view" panelClose /> : ''}
        {user ? <ListItem link="/offers/" title={labels.offers} view="#main-view" panelClose /> : ''}
        {user ? <ListItem link="/profits/" title={labels.profits} view="#main-view" panelClose /> : ''}
        {user ? <ListItem link="/logs/" title={labels.logs} view="#main-view" panelClose /> : ''}
      </List>
    </Page>
  )
}
export default Panel
