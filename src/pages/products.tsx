import { useContext, useState, useEffect } from 'react'
import { f7, Page, Block, Navbar, List, ListItem, Searchbar, NavRight, Link, Fab, Icon, FabButton, FabButtons, FabBackdrop } from 'framework7-react'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { productOfText, getCategoryName } from '../data/actions'
import { Category, Country, Product, Trademark } from '../data/types'

type Props = {
  id: string
}
type ExtendedProduct = Product & {
  categoryInfo: Category,
  trademarkInfo?: Trademark,
  countryInfo: Country
}
const Products = (props: Props) => {
  const { state } = useContext(StateContext)
  const [category] = useState(() => state.categories.find(c => c.id === props.id))
  const [products, setProducts] = useState<ExtendedProduct[]>([])
  useEffect(() => {
    setProducts(() => {
      const products = state.products.filter(p => props.id === '-1' ? !state.packs.find(pa => pa.product.id === p.id) || state.packs.filter(pa => pa.product.id === p.id).length === state.packs.filter(pa => pa.product.id === p.id && pa.price === 0).length : props.id === '0' || p.categoryId === props.id)
      const results = products.map(p => {
        const categoryInfo = state.categories.find(c => c.id === p.categoryId)!
        const trademarkInfo = state.trademarks.find(t => t.id === p.trademarkId)
        const countryInfo = state.countries.find(c => c.id === p.countryId)!
        return {
          ...p,
          categoryInfo,
          trademarkInfo,
          countryInfo
        }
      })
      return results.sort((p1, p2) => p1.categoryId === p2.categoryId ? (p1.name > p2.name ? 1 : -1) : (p1.categoryInfo?.name! > p2.categoryInfo?.name! ? 1 : -1))
    })
  }, [state.products, state.categories, state.packs, state.countries, state.trademarks, props.id])
  
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
            : products.map(p => 
                <ListItem
                  link={`/product-packs/${p.id}/type/n`}
                  title={p.name}
                  subtitle={p.alias}
                  text={p.description}
                  footer={productOfText(p.countryInfo.name, p.trademarkInfo?.name)}
                  key={p.id}
                >
                  <img slot="media" src={p.imageUrl} className="img-list" alt={labels.noImage} />
                  <div className="list-subtext1">{getCategoryName(p.categoryInfo!, state.categories)}</div>
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
    </Page>
  )
}

export default Products