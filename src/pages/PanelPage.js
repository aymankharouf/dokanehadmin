import React, { useContext } from 'react';
import { Page, Navbar, Block, List, ListItem } from 'framework7-react';
import { StoreContext } from '../data/Store';
import { logout } from '../data/Actions'

const PanelPage = props => {
  const { state, user } = useContext(StoreContext)
  const login_logout = user ? <ListItem link="#" onClick={() => logout()} title={state.labels.logout} /> : <ListItem link="/login/panel" title={state.labels.login} />
  return(
    <Page>
      <Navbar title={state.labels.mainPanelTitle} />
      <Block strong>
        <p>{user ? user.displayName : ''}</p>
      </Block>
      <List>
        {login_logout}
      </List>
      <List>
        {user ? <ListItem link="/settings/" title={state.labels.settings} view="#main-view" panelClose /> : ''}
        {user ? <ListItem link="/requestedPacks/" title={state.labels.newPurchase} view="#main-view" panelClose /> : ''}
        {user ? <ListItem link="/priceAlarms/" title={state.labels.priceAlarms} view="#main-view" panelClose /> : ''}
      </List>
    </Page>
  )
}
export default PanelPage
