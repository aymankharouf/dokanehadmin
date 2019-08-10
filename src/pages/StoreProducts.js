import React, { useContext } from 'react'
import { Block, Fab, Icon, Page, Navbar, List, ListItem, Toolbar, Searchbar, NavRight, Link, FabButton, FabButtons} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';
import moment from 'moment'
import 'moment/locale/ar'

const StoreProducts = props => {
  const { state, products } = useContext(StoreContext)
  let storeProducts = products.filter(product => product.stores.find(store => store.id === props.id))
  storeProducts = storeProducts.map(product => {
    return {
      id: product.id,
      name: product.name,
      size: product.size,
      unit: product.unit,
      price: product.stores.find(rec => rec.id === props.id).price,
      time: product.stores.find(rec => rec.id === props.id).time,
      imageUrl: product.imageUrl
    }
  })
  storeProducts.sort((product1, product2) => product2.time.seconds - product1.time.seconds)
  const store = state.stores.find(store => store.id === props.id)
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
      <Block>
        <List className="searchbar-not-found">
          <ListItem title={state.labels.noData} />
        </List>
        <List mediaList className="search-list searchbar-found">
          {storeProducts.map(product => 
            <ListItem
              link={`/storeProduct/${store.id}/product/${product.id}`}
              title={product.name}
              after={product.price}
              subtitle={`${product.size} ${state.units.find(rec => rec.id === product.unit).name}`}
              text={moment(product.time.toDate()).fromNow()}
              key={product.id}
            >
              <img slot="media" src={product.imageUrl} width="80" className="lazy lazy-fadeIn demo-lazy" alt=""/>
            </ListItem>
          )}
          {storeProducts.length === 0 ? <ListItem title={state.labels.noData} /> : null}
        </List>
      </Block>
      <Fab position="right-bottom" slot="fixed" color="pink">
        <Icon ios="f7:add" aurora="f7:add" md="material:add"></Icon>
        <Icon ios="f7:close" aurora="f7:close" md="material:close"></Icon>
        <FabButtons position="top">
          <FabButton color="green" label={state.labels.newProduct} onClick={() => props.f7router.navigate(`/newProduct/${props.id}`)}>
            <Icon ios="f7:star_fill" aurora="f7:star_fill" md="material:star"></Icon>
          </FabButton>
          <FabButton color="blue" label={state.labels.existProduct} onClick={() => props.f7router.navigate(`/addProduct/${props.id}`)}>
            <Icon ios="f7:search" aurora="f7:search" md="material:search"></Icon>
          </FabButton>
        </FabButtons>
      </Fab>

      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default StoreProducts
