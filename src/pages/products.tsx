import { useContext, useState, useEffect } from 'react'
import { f7, Page, Block, Navbar, List, ListItem, Searchbar, NavRight, Link, Fab, Icon, FabButton, FabButtons, FabBackdrop, Toolbar } from 'framework7-react'
import Footer from './footer'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { productOfText, getCategoryName } from '../data/actions'

interface Props {
  id: string
}
const Products = (props: Props) => {
  const { state } = useContext(StoreContext)
  const [category] = useState(() => state.categories.find((c: any) => c.id === props.id))
  const [products, setProducts] = useState([])
  useEffect(() => {
    setProducts(() => {
      let products = state.products.filter((p: any) => props.id === '-1' ? !state.packs.find((pa: any) => pa.productId === p.id) || state.packs.filter((pa: any) => pa.productId === p.id).length === state.packs.filter((pa: any) => pa.productId === p.id && pa.price === 0).length : props.id === '0' || p.categoryId === props.id)
      products = products.map((p: any) => {
        const categoryInfo = state.categories.find((c: any) => c.id === p.categoryId)
        return {
          ...p,
          categoryInfo
        }
      })
      return products.sort((p1: any, p2: any) => p1.categoryId === p2.categoryId ? (p1.name > p2.name ? 1 : -1) : (p1.categoryInfo.name > p2.categoryInfo.name ? 1 : -1))
    })
  }, [state.products, state.categories, state.packs, props.id])
  
  if (!state.user) return <Page><h3 className="center"><a href="/login/">{labels.relogin}</a></h3></Page>
  return(
    <Page>
      <Navbar title={props.id === '-1' ? labels.notUsedProducts : (props.id === '0' ? labels.products : category?.name || '')} backLink={labels.back}>
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
            : products.map((p: any) => 
                <ListItem
                  link={`/product-packs/${p.id}/type/n`}
                  title={p.name}
                  subtitle={p.ename}
                  text={p.description}
                  footer={productOfText(p.trademark, p.country)}
                  key={p.id}
                >
                  <img slot="media" src={p.imageUrl} className="img-list" alt={labels.noImage} />
                  <div className="list-subtext1">{getCategoryName(p.categoryInfo, state.categories)}</div>
                </ListItem>
              )
            }
          </List>
      </Block>
      <FabBackdrop slot="fixed" />
      <Fab position="left-top" slot="fixed" color="orange" className="top-fab">
        <Icon material="keyboard_arrow_down"></Icon>
        <Icon material="close"></Icon>
        <FabButtons position="bottom">
          <FabButton color="green" onClick={() => f7.views.current.router.navigate(`/add-product/${props.id}`)}>
            <Icon material="add"></Icon>
          </FabButton>
          <FabButton color="blue" onClick={() => f7.views.current.router.navigate('/archived-products/')}>
            <Icon material="backup"></Icon>
          </FabButton>
          <FabButton color="red" onClick={() => f7.views.current.router.navigate('/products/-1')}>
            <Icon material="remove_shopping_cart"></Icon>
          </FabButton>

        </FabButtons>
      </Fab>
      <Toolbar bottom>
        <Footer/>
      </Toolbar>
    </Page>
  )
}

export default Products