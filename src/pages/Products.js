import React, { useContext, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Searchbar, NavRight, Link} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';

const Products = props => {
  const { state, products } = useContext(StoreContext)
  const [orderBy, setOrderBy] = useState('v')
  const [allProducts, setAllProducts] = useState(products)
  useEffect(() => {
    const sort = (value) => {
      switch(value){
        case 'v':
          setAllProducts([...allProducts].sort((product1, product2) => product1.price / product1.size - product2.price / product2.size))
          break
        case 'p':
          setAllProducts([...allProducts].sort((product1, product2) => product1.price - product2.price))
          break
        case 's':
          setAllProducts([...allProducts].sort((product1, product2) => product2.sales - product1.sales))
          break
        case 'r':
          setAllProducts([...allProducts].sort((product1, product2) => product2.rating - product1.rating))
          break
        default:
          return null
      }
    }
    sort(orderBy)
  }, [orderBy])
  const orderByList = state.orderByList.map(orderByItem => orderByItem.id === 0 ? <option key={orderByItem.id} value={orderByItem.id} disabled>{orderByItem.name}</option> : <option key={orderByItem.id} value={orderByItem.id}>{orderByItem.name}</option>)
  return(
    <Page>
      <Navbar title={state.labels.allProducts} backLink="Back">
        <NavRight>
          <Link searchbarEnable=".searchbar-demo" iconIos="f7:search" iconAurora="f7:search" iconMd="material:search"></Link>
        </NavRight>
      </Navbar>
      <Block>
        <List>
          <ListItem
            title={state.labels.order}
            smartSelect
            smartSelectParams={{openIn: 'popover', closeOnSelect: true}}
          >
            <select name="order" value={orderBy} onChange={(e) => setOrderBy(e.target.value)}>
              {orderByList}
            </select>
          </ListItem>
          <Searchbar
            className="searchbar-demo"
            searchContainer=".search-list"
            searchIn=".item-title, .item-subtitle"
            clearButton
            expandable
            placeholder={state.labels.search}
          ></Searchbar>
        </List>
        <List className="searchbar-not-found">
          <ListItem title={state.labels.noData} />
        </List>
        <List mediaList className="search-list searchbar-found">
          {allProducts && allProducts.map(product => 
            <ListItem
              link={`/product/${product.id}`}
              title={product.name}
              after={product.price}
              subtitle={`${product.size} ${state.units.find(rec => rec.id === product.unit).name}`}
              text={`${state.labels.productOf} ${state.countries.find(rec => rec.id === product.country).name}`}
              key={product.id}
              className={product.status === 'd' ? 'disable-product' : ''}
            >
              <img slot="media" src={product.imageUrl} width="80" className="lazy lazy-fadeIn demo-lazy" alt=""/>
            </ListItem>
          )}
        </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Products