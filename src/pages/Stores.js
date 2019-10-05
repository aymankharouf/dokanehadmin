import React, { useContext } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon } from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';
import { addStock } from '../data/Actions'


const Stores = props => {
  const { state, dispatch } = useContext(StoreContext)
  const stores = state.stores.filter(rec => rec.id !== 's')
  stores.sort((store1, store2) => store1.name > store2.name ? 1 : -1)
  const stock = state.stores.find(rec => rec.id === 's')
  const handleAddStock = (name) => {
    addStock(name).then(() => {
      dispatch({type: 'ADD_STORE', store: {id: 's', name}})
      props.f7router.back()
    })

}
  return (
    <Page>
      <Navbar title={state.labels.stores} backLink={state.labels.back} />
      <Fab position="left-top" slot="fixed" color="green" onClick={() => props.f7router.navigate('/addStore/')}>
        <Icon ios="f7:add" aurora="f7:add" md="material:add"></Icon>
      </Fab>
      <Block>
        <List>
          {stores && stores.map(rec =>
            <ListItem 
              link={`/store/${rec.id}`} 
              title={rec.name} 
              footer={`${rec.address || ''} ${rec.mobile || ''}`}
              key={rec.id} 
              badge={rec.isActive === false ? state.labels.inActive : ''}
              badgeColor='red' 
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
