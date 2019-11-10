import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon } from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';
import { addHareesStore, showMessage } from '../data/Actions'


const Stores = props => {
  const { state } = useContext(StoreContext)
  const stores = useMemo(() => {
    const stores = state.stores
    return stores.sort((rec1, rec2) => rec1.name > rec2.name ? 1 : -1)
  }, [state.stores])
  const hareesStore = useMemo(() => state.stores.find(rec => rec.id === 's'), [state.stores])
  const handleAddHareesStore = (name) => {
    addHareesStore(name).then(() => {
      showMessage(props, 'success', state.labels.addSuccess)
      props.f7router.back()
    })

}
  return (
    <Page>
      <Navbar title={state.labels.stores} backLink={state.labels.back} />
      <Block>
        <List>
          {stores && stores.map(rec =>
            <ListItem 
              link={`/store/${rec.id}`} 
              title={rec.name} 
              footer={`${rec.address || ''} ${rec.mobile || ''}`}
              key={rec.id} 
            />
          )}
          {stores.length === 0 ? <ListItem title={state.labels.noData} /> : ''}
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" onClick={() => props.f7router.navigate('/addStore/')}>
        <Icon material="add"></Icon>
      </Fab>
      {hareesStore ? '' : 
        <Fab position="center-bottom" slot="fixed" color="red" text={state.labels.stockName} onClick={() => handleAddHareesStore(state.labels.stockName)}>
          <Icon material="add"></Icon>
        </Fab>
      }
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Stores
