import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Searchbar, NavRight, Link, Fab, Icon } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { getCategoryName } from '../data/actions'
import ReLogin from './relogin'

const Products = props => {
  const { state, user } = useContext(StoreContext)
  const products = useMemo(() => {
    const products = state.products.map(p => {
      const categoryInfo = state.categories.find(c => c.id === p.categoryId)
      return {
        ...p,
        categoryInfo
      }
    })
    return products.sort((p1, p2) => p1.sales - p2.sales)
  }, [state.products, state.categories])
  
  if (!user) return <ReLogin />
  return(
    <Page>
      <Navbar title={labels.allProducts} backLink={labels.back}>
        <NavRight>
          <Link searchbarEnable=".searchbar" iconMaterial="search"></Link>
        </NavRight>
        <Searchbar
          className="searchbar"
          searchContainer=".search-list"
          searchIn=".item-title, .item-subtitle"
          clearButton
          expandable
          placeholder={labels.search}
        />
      </Navbar>
        <Block>
          <List className="searchbar-not-found">
            <ListItem title={labels.noData} />
          </List>
          <List mediaList className="search-list searchbar-found">
            {products.length === 0 ? 
              <ListItem title={labels.noData} /> 
            : products.map(p => 
                <ListItem
                  link={`/product-packs/${p.id}`}
                  title={p.name}
                  subtitle={getCategoryName(p.categoryInfo, state.categories)}
                  text={`${labels.productOf} ${p.trademark ? labels.company + ' ' + p.trademark + '-' : ''}${p.country}`}
                  key={p.id}
                >
                  <img slot="media" src={p.imageUrl} className="img-list" alt={p.name} />
                </ListItem>
              )
            }
          </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" href="/add-product/">
        <Icon material="add"></Icon>
      </Fab>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Products