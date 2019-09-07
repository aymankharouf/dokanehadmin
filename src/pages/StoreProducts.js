import React, { useContext } from 'react'
import { Block, Fab, Icon, Page, Navbar, List, ListItem, Toolbar, Searchbar, NavRight, Link, Badge} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';
import moment from 'moment'
import 'moment/locale/ar'

const StoreProducts = props => {
  const { state } = useContext(StoreContext)
  let storeProducts = state.products.filter(product => product.stores.find(store => store.id === props.id))
  storeProducts = storeProducts.map(product => {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      isNew: product.isNew,
      isOffer: product.isOffer,
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
              after={(product.price / 1000).toFixed(3)}
              subtitle={product.description}
              text={moment(product.time.toDate()).fromNow()}
              key={product.id}
            >
              <img slot="media" src={product.imageUrl} width="80" className="lazy lazy-fadeIn demo-lazy" alt=""/>
              {product.isNew ? <Badge slot="title" color='red'>{state.labels.new}</Badge> : null}
              {product.isOffer ? <Badge slot="title" color='green'>{state.labels.offer}</Badge> : null}
            </ListItem>
          )}
          {storeProducts.length === 0 ? <ListItem title={state.labels.noData} /> : null}
        </List>
      </Block>
      <Fab position="right-bottom" slot="fixed" color="pink" morphTo=".toolbar.fab-morph-target">
        <Icon ios="f7:add" aurora="f7:add" md="material:add"></Icon>
      </Fab>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
      <Toolbar bottom className="fab-morph-target">
        <Link onClick={() => props.f7router.navigate(`/newProduct/${props.id}`)}>{state.labels.newProduct}</Link>
        <Link onClick={() => props.f7router.navigate(`/addProduct/${props.id}`)}>{state.labels.existProduct}</Link>
      </Toolbar>
    </Page>
  )
}

export default StoreProducts
