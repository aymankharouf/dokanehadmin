import React, { useContext } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';


const Stores = props => {
  const { state } = useContext(StoreContext)
  const stores = state.stores.filter(rec => rec.storeType !== 'i')

  return (
    <Page>
      <Navbar title={state.labels.stores} backLink="Back" />
      <Fab position="left-top" slot="fixed" color="green" onClick={() => props.f7router.navigate('/addStore/')}>
        <Icon ios="f7:add" aurora="f7:add" md="material:add"></Icon>
      </Fab>
      <Block>
        <List>
          {stores && stores.map(store =>
            <ListItem title={store.name} link={`/store/${store.id}`} key={store.id} />
          )}
          {stores.length === 0 ? <ListItem title={state.labels.noData} /> : null}
        </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Stores
