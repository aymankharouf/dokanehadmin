import React, { useContext, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Searchbar, NavRight, Link, Fab, Icon, FabButton, FabButtons } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { productOfText } from '../data/actions'

const Products = props => {
  const { state, user } = useContext(StoreContext)
  const [category] = useState(() => state.categories.find(c => c.id === props.id))
  const [products, setProducts] = useState([])
  useEffect(() => {
    setProducts(() => {
      let products = state.products.filter(p => props.id === '0' || p.categoryId === props.id)
      products = products.map(p => {
        const categoryInfo = state.categories.find(c => c.id === p.categoryId)
        return {
          ...p,
          categoryInfo
        }
      })
      return products.sort((p1, p2) => p2.sales - p1.sales)
    })
  }, [state.products, state.categories, props.id])
  
  if (!user) return <Page><h3 className="center"><a href="/login/">{labels.relogin}</a></h3></Page>
  return(
    <Page>
      <Navbar title={props.id === '0' ? labels.products : category?.name || ''} backLink={labels.back}>
        <NavRight>
          <Link searchbarEnable=".searchbar" iconMaterial="search"></Link>
        </NavRight>
        <Searchbar
          className="searchbar"
          searchContainer=".search-list"
          searchIn=".item-inner"
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
                  link={`/product-packs/${p.id}/type/n`}
                  title={p.name}
                  subtitle={p.alias}
                  text={p.description}
                  footer={productOfText(p.trademark, p.country)}
                  key={p.id}
                >
                  <img slot="media" src={p.imageUrl} className="img-list" alt={labels.noImage} />
                  <div className="list-subtext1">{p.categoryInfo.name}</div>
                </ListItem>
              )
            }
          </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="orange" className="top-fab">
        <Icon material="keyboard_arrow_down"></Icon>
        <Icon material="close"></Icon>
        <FabButtons position="bottom">
          <FabButton color="green" onClick={() => props.f7router.navigate(`/add-product/${props.id}`)}>
            <Icon material="add"></Icon>
          </FabButton>
          <FabButton color="blue" onClick={() => props.f7router.navigate('/archived-products/')}>
            <Icon material="backup"></Icon>
          </FabButton>
        </FabButtons>
      </Fab>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Products