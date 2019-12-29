import React, { useContext } from 'react'
import { Page, Navbar, List, ListItem } from 'framework7-react'
import { StoreContext } from '../data/store'
import { logout } from '../data/actions'

const Panel = props => {
  const { state, user, dispatch } = useContext(StoreContext)
  const handleLogout = () => {
    logout().then(() => {
      props.f7router.app.views.main.router.navigate('/home/', {reloadAll: true})
      props.f7router.app.panel.close('right') 
      dispatch({type: 'CLEAR_BASKET'})
    })
  }

  return(
    <Page>
      <Navbar title={state.labels.mainPanelTitle} />
      <List>
        {user ? 
          <ListItem 
            link="#" 
            title={state.labels.logout} 
            onClick={() => handleLogout()} 
          />
        :
          <ListItem 
            link="/panelLogin/"
            title={state.labels.login}
          />
        }
        {user ? <ListItem link="/changePassword/" title={state.labels.changePassword} /> : ''}
        {user ? <ListItem link="/settings/" title={state.labels.settings} view="#main-view" panelClose /> : ''}
        {user ? <ListItem link="/requestedPacks/" title={state.labels.requestedPacks} view="#main-view" panelClose /> : ''}
        {user ? <ListItem link="/prepareOrders/" title={state.labels.prepareOrders} view="#main-view" panelClose /> : ''}
        {user ? <ListItem link="/followupOrders/" title={state.labels.followupOrders} view="#main-view" panelClose /> : ''}
        {user ? <ListItem link="/approvals/" title={state.labels.approvals} view="#main-view" panelClose /> : ''}
        {user ? <ListItem link="/offers/" title={state.labels.offers} view="#main-view" panelClose /> : ''}
        {user ? <ListItem link="/profits/" title={state.labels.profits} view="#main-view" panelClose /> : ''}
        {user ? <ListItem link="/logs/" title={state.labels.logs} view="#main-view" panelClose /> : ''}
      </List>
    </Page>
  )
}
export default Panel
