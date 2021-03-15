import { useContext, useState, useEffect } from 'react'
import { f7, Page, Block, Navbar, List, ListItem, Searchbar, NavRight, Link, Fab, Icon } from 'framework7-react'
import Footer from './footer'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { getCategoryName, getArchivedProducts, getArchivedPacks, getMessage, showError } from '../data/actions'

const ArchivedProducts = () => {
  const { state, user, dispatch } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [products, setProducts] = useState([])
  useEffect(() => {
    setProducts(() => {
      const products = state.archivedProducts.map(p => {
        const categoryInfo = state.categories.find(c => c.id === p.categoryId)
        return {
          ...p,
          categoryInfo
        }
      })
      return products.sort((p1, p2) => p1.sales - p2.sales)
    })
  }, [state.archivedProducts, state.categories])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  useEffect(() => {
    if (inprocess) {
      f7.dialog.preloader(labels.inprocess)
    } else {
      f7.dialog.close()
    }
  }, [inprocess])
  const handleRetreive = async () => {
    try{
      setInprocess(true)
      const products = await getArchivedProducts()
      if (products.length > 0) {
        dispatch({type: 'SET_ARCHIVED_PRODUCTS', products})
      }
      const packs = await getArchivedPacks()
      if (packs.length > 0) {
        dispatch({type: 'SET_ARCHIVED_PACKS', packs})
      }
      setInprocess(false)
    } catch(err) {
      setInprocess(false)
      setError(getMessage(f7.views.current.router.currentRoute.path, err))
    }
  }
  if (!user) return <Page><h3 className="center"><a href="/login/">{labels.relogin}</a></h3></Page>
  return(
    <Page>
      <Navbar title={labels.archivedProducts} backLink={labels.back}>
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
                  link={`/product-packs/${p.id}/type/a`}
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
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleRetreive()}>
        <Icon material="cached"></Icon>
      </Fab>
      <Footer/>
    </Page>
  )
}

export default ArchivedProducts