import React, { useContext } from 'react';
import { Page, Navbar, Block, BlockTitle, List, ListItem } from 'framework7-react';
import { StoreContext } from '../data/Store';
import firebase from '../data/firebase'

const PanelPage = props => {
  const { user } = useContext(StoreContext)
  const login_logout = user ? <ListItem link="#" onClick={() => firebase.auth().signOut()} title="Log Out"></ListItem> : <ListItem link="/login/panel" title="Login"></ListItem>
  return(
    <Page>
      <Navbar title="Right Panel" />
      <Block strong>
        <p>{user ? firebase.auth().currentUser.displayName : ''}</p>
      </Block>
      <BlockTitle>Load page in panel</BlockTitle>
      <List>
        {login_logout}
      </List>
      <BlockTitle>Load page in main view</BlockTitle>
      <List>
        { user ? <ListItem link="/ordersList/" title="Orders" view="#main-view" panelClose></ListItem> : null }
        <ListItem link="/activeOrders/" title="Active Orders" view="#main-view" panelClose></ListItem>
        <ListItem link="/stores/" title="Today Prices" view="#main-view" panelClose></ListItem>
      </List>
    </Page>
  )
}
export default PanelPage
