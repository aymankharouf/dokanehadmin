import React, { useContext } from 'react'
import { Block, Fab, Icon, Page, Navbar, List, ListItem, Toolbar, Searchbar, NavRight, Link} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';

const StoreProducts = props => {
  const { state, newStores, products } = useContext(StoreContext)
  const storeProducts = products.filter(product => product.stores.findIndex(store => store.id === props.id) >= 0)
  const store = newStores.find(store => store.id === props.id)
  const handleAdd = () => {
    props.f7router.navigate(`/addProduct/${props.id}`)
  }
  return(
    <Page>
      <Navbar title={`${store.name}`} backLink="Back">
      <NavRight>
        <Link searchbarEnable=".searchbar-demo" iconIos="f7:search" iconAurora="f7:search" iconMd="material:search"></Link>
      </NavRight>
      <Searchbar
        className="searchbar-demo"
        searchContainer=".search-list"
        searchIn=".item-title, .item-subtitle"
        clearButton
        expandable
        placeholder={state.labels.search}
      ></Searchbar>
      </Navbar>
      <Fab position="left-top" slot="fixed" color="green" onClick={() => handleAdd()}>
        <Icon ios="f7:add" aurora="f7:add" md="material:add"></Icon>
      </Fab>
      <Block>
        <List className="searchbar-not-found">
          <ListItem title={state.labels.not_found} />
        </List>
        <List mediaList className="search-list searchbar-found">
          {storeProducts.map(product => {
            return (
              <ListItem
                link={`/storeProduct/${store.id}/product/${product.id}`}
                title={product.name}
                after={parseFloat(product.stores.find(productStore => productStore.id === store.id).price).toFixed(3)}
                subtitle={state.trademarks.find(trademark => trademark.id === product.trademark).name}
                text={product.name}
                key={product.id}
              >
                <img slot="media" src={product.imageUrl} width="80" className="lazy lazy-fadeIn demo-lazy" alt=""/>
              </ListItem>
            )
          })}
          {storeProducts.length === 0 ? <ListItem title="No Products" /> : null}
        </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default StoreProducts
