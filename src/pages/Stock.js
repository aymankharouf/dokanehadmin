import React, { useContext } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Searchbar, NavRight, Link, Badge} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';
import ReLogin from './ReLogin'

const Stock = props => {
  const { state, products, user } = useContext(StoreContext)
  if (!user) return <ReLogin callingPage="stock"/>
  const stock = state.stores.find(rec => rec.storeType === 'i')
  let storeProducts = products.filter(product => product.stores.find(store => store.id === stock.id))
  storeProducts = storeProducts.map(product => {
    return {
      id: product.id,
      name: product.name,
      country: product.country,
      description: product.description,
      quantity: product.stores.find(rec => rec.id === stock.id).quantity,
      price: product.stores.find(rec => rec.id === stock.id).price,
      purchasePrice: product.stores.find(rec => rec.id === stock.id).purchasePrice,
      time: product.stores.find(rec => rec.id === stock.id).time,
      imageUrl: product.imageUrl
    }
  })
  storeProducts.sort((product1, product2) => product1.time.seconds - product2.time.seconds)
  return(
    <Page>
      <Navbar title={state.labels.stock} backLink="Back">
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
              link={`/stockTrans/${product.id}`}
              title={product.name}
              after={(product.purchasePrice).toFixed(3)}
              subtitle={product.description}
              text={`${state.labels.productOf} ${state.countries.find(rec => rec.id === product.country).name}`}
              key={product.id}
            >
              <img slot="media" src={product.imageUrl} width="80" className="lazy lazy-fadeIn demo-lazy" alt=""/>
              <Badge slot="title" color="red">{product.quantity}</Badge>
            </ListItem>
          )}
          {storeProducts.length === 0 ? <ListItem title={state.labels.noData} /> : null}
        </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Stock
