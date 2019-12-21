import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Searchbar, NavRight, Link, Badge, Fab, Icon} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';

const Products = props => {
  const { state } = useContext(StoreContext)
  const products = useMemo(() => [...state.products].sort((p1, p2) => p1.name > p2.name ? 1 : -1)
  , [state.products])
  return(
    <Page>
      <Navbar title={state.labels.allProducts} backLink={state.labels.back} className="page-title">
        <NavRight>
          <Link searchbarEnable=".searchbar" iconMaterial="search"></Link>
        </NavRight>
        <Searchbar
          className="searchbar"
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
            {products && products.map(p => {
              return (
                <ListItem
                  link={`/product/${p.id}`}
                  title={p.name}
                  key={p.id}
                >
                  <img slot="media" src={p.imageUrl} className="img-list" alt={p.name} />
                  {p.isNew ? <Badge slot="title" color='red'>{state.labels.new}</Badge> : ''}
                  <span className="list-line1">{state.categories.find(c => c.id === p.categoryId).name}</span><br />
                  <span className="list-line2">{`${state.labels.productOf} ${state.countries.find(c => c.id === p.countryId).name}`}</span><br />
                </ListItem>
              )
            }
            )}
            {state.products.length === 0 ? <ListItem title={state.labels.noData} /> : ''}
          </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" href="/addProduct/">
        <Icon material="add"></Icon>
      </Fab>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Products