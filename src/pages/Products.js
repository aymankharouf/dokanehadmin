import React, { useContext, useEffect, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Searchbar, NavRight, Link, Badge, Fab, Icon} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';

const Products = props => {
  const { state } = useContext(StoreContext)
  const products = useMemo(() => [...state.products].sort((rec1, rec2) => rec1.name > rec2.name ? 1 : -1), [state.products])
  return(
    <Page>
      <Navbar title={state.labels.allProducts} backLink={state.labels.back}>
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
        />
      </Navbar>
        <Block>
          <List className="searchbar-not-found">
            <ListItem title={state.labels.noData} />
          </List>
          <List mediaList className="search-list searchbar-found">
            {products && products.map(product => {
              return (
                <ListItem
                  link={`/product/${product.id}`}
                  title={product.name}
                  subtitle={state.categories.find(rec => rec.id === product.category).name}
                  text={`${state.labels.productOf} ${state.countries.find(rec => rec.id === product.country).name}`}
                  key={product.id}
                  badge={product.isActive === false ? state.labels.inActive : ''}
                  badgeColor='red' 
                >
                  <img slot="media" src={product.imageUrl} className="lazy lazy-fadeIn demo-lazy avatar" alt=""/>
                  {product.isNew ? <Badge slot="title" color='red'>{state.labels.new}</Badge> : null}
                </ListItem>
              )
            }
            )}
            {state.products.length === 0 ? <ListItem title={state.labels.noData} /> : null}
          </List>
      </Block>
      <Fab position="left-bottom" slot="fixed" color="green" onClick={() => props.f7router.navigate(`/addProduct/`)}>
        <Icon ios="f7:add" aurora="f7:add" md="material:add"></Icon>
      </Fab>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Products