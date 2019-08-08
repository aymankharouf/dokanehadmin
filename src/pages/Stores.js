import React, { useContext } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';


const Stores = props => {
  const { state } = useContext(StoreContext)
  const stores = state.stores.filter(rec => rec.storeType !== 'i')
  const handleAdd = () => {
    props.f7router.navigate('/addStore/')
  }

  return (
    <Page>
      <Navbar title="Stores" backLink="Back" />
      <Fab position="left-top" slot="fixed" color="green" onClick={() => handleAdd()}>
        <Icon ios="f7:add" aurora="f7:add" md="material:add"></Icon>
      </Fab>
      <Block>
          <List>
            {stores && stores.map(store =>
              <ListItem title={store.name} link={`/store/${store.id}`} key={store.id} />
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
