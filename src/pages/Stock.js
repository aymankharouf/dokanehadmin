import React, { useContext } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Searchbar, NavRight, Link} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';
import moment from 'moment'
import 'moment/locale/ar'
import ReLogin from './ReLogin'

const Stock = props => {
  const { state, products, user } = useContext(StoreContext)
  if (!user) return <ReLogin callingPage="inventory"/>
  const stock = state.stores.find(rec => rec.storeType === 'i')
  let storeProducts = products.filter(product => product.stores.find(store => store.id === stock.id))
  storeProducts = storeProducts.map(product => {
    return {
      id: product.id,
      name: product.name,
      size: product.size,
      unit: product.unit,
      quantity: product.stores.find(rec => rec.id === stock.id).quantity,
      price: product.stores.find(rec => rec.id === stock.id).price,
      purchasePrice: product.stores.find(rec => rec.id === stock.id).purchasePrice,
      time: product.stores.find(rec => rec.id === stock.id).time,
      imageUrl: product.imageUrl
    }
  })
  storeProducts.sort((product1, product2) => product1.time - product2.time)
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
              after={product.quantity}
              subtitle={`${product.size} ${state.units.find(rec => rec.id === product.unit).name}`}
              text={parseFloat(product.purchasePrice).toFixed(3)}
              key={product.id}
            >
              <img slot="media" src={product.imageUrl} width="80" className="lazy lazy-fadeIn demo-lazy" alt=""/>
            </ListItem>
          )}
          {storeProducts.length === 0 ? <ListItem title="No Products" /> : null}
        </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Stock
