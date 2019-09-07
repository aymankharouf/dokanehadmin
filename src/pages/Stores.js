import React, { useContext } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon } from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';
import { addStock } from '../data/Actions'


const Stores = props => {
  const { state, dispatch } = useContext(StoreContext)
  const stores = state.stores.filter(rec => rec.id !== 's')
  const stock = state.stores.find(rec => rec.id === 's')
  const handleAddStock = (name) => {
    addStock(name).then(() => {
      dispatch({type: 'ADD_STORE', store: {id: 's', name}})
      props.f7router.back()
    })

}
  return (
    <Page>
      <Navbar title={state.labels.stores} backLink="Back" />
      <Fab position="left-top" slot="fixed" color="green" onClick={() => props.f7router.navigate('/addStore/')}>
        <Icon ios="f7:add" aurora="f7:add" md="material:add"></Icon>
      </Fab>
      <Block>
        <List>
          {stores && stores.map(store =>
            <ListItem 
              link={`/store/${store.id}`} 
              title={store.name} 
              footer={`${store.address || ''} ${store.mobile || ''}`}
              key={store.id} 
            />
          )}
          {stores.length === 0 ? <ListItem title={state.labels.noData} /> : null}
        </List>
      </Block>
      {stock ? null : 
        <Fab position="center-bottom" slot="fixed" color="red" text={state.labels.stockName} onClick={() => handleAddStock(state.labels.stockName)}>
          <Icon ios="f7:add" aurora="f7:add" md="material:add"></Icon>
        </Fab>
      }
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default React.memo(Stores)
