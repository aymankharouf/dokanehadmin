import React, { useContext } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';


const Stores = props => {
  const { state } = useContext(StoreContext)
  return (
    <Page>
      <Navbar title="Stores" backLink="Back" />
      <Block>
          <List>
            {state.stores && state.stores.map(store =>
              <ListItem title={store.name} link={`/store/${store.id}`} key={store.id}>
              </ListItem>
            )}
          </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Stores
