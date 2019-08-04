import React, { useContext, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Searchbar, NavRight, Link} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';

const Products = props => {
  const { state, products } = useContext(StoreContext)
  const [orderBy, setOrderBy] = useState('v')
  const [allProducts, setAllProducts] = useState(products)
  const sort = () => {
    switch(orderBy){
      case 'v':
        setAllProducts([...allProducts].sort((producta, productb) => producta.price / producta.quantity - productb.price / productb.quantity))
        break
      case 'p':
        setAllProducts([...allProducts].sort((producta, productb) => producta.price - productb.price))
        break
      case 's':
        setAllProducts([...allProducts].sort((producta, productb) => productb.sales - producta.sales))
        break
      case 'r':
        setAllProducts([...allProducts].sort((producta, productb) => productb.rating - producta.rating))
        break
      case 't':
        setAllProducts([...allProducts].sort((producta, productb) => productb.time.seconds - producta.time.seconds))
        break
      default:
        return null
    }
  }
  useEffect(() => {
    sort(orderBy)
  }, [orderBy])
  const orderByList = state.orderByList.map(orderByItem => orderByItem.id === 0 ? <option key={orderByItem.id} value={orderByItem.id} disabled>{orderByItem.name}</option> : <option key={orderByItem.id} value={orderByItem.id}>{orderByItem.name}</option>)
  return(
      <Page>
        <Navbar title='All Products' backLink="Back">
        <NavRight>
      <Link searchbarEnable=".searchbar-demo" iconIos="f7:search" iconAurora="f7:search" iconMd="material:search"></Link>
    </NavRight>
    </Navbar>
        <Block>
            <List>
              <ListItem
                title="Order"
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
              <ListItem title={state.labels.not_found} />
            </List>
            <List mediaList className="search-list searchbar-found">
              {allProducts && allProducts.map(product => {
                return (
                  <ListItem
                    link={`/product/${product.id}`}
                    title={product.name}
                    after={parseFloat(product.price).toFixed(3)}
                    subtitle={product.trademark ? state.trademarks.find(trademark => trademark.id === product.trademark).name : ''}
                    text={product.name}
                    key={product.id}
                    className={product.status === '2' ? 'disable-product' : ''}
                  >
                    <img slot="media" src={product.imageUrl} width="80" className="lazy lazy-fadeIn demo-lazy" alt=""/>
                  </ListItem>
                )
              })}
            </List>
        </Block>
        <Toolbar bottom>
          <BottomToolbar/>
        </Toolbar>
      </Page>
  )
}

export default Products