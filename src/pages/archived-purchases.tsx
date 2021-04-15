import { useContext, useState, useEffect, useRef } from 'react'
import { f7, Page, Block, Navbar, List, ListItem, NavRight, Searchbar, Link, Fab, Icon, Toolbar } from 'framework7-react'
import Footer from './footer'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { getArchivedPurchases, getMessage, showError } from '../data/actions'

const ArchivedPurchases = () => {
  const { state, dispatch } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [purchases, setPurchases] = useState<any>([])
  const [monthlyTrans] = useState(() => [...state.monthlyTrans.sort((t1: any, t2: any) => t2.id - t1.id)])
  const lastMonth = useRef(0)
  useEffect(() => {
    setPurchases(() => {
      const purchases = state.archivedPurchases.map((p: any) => {
        const storeInfo = state.stores.find((s: any) => s.id === p.storeId)
        return {
          ...p,
          storeInfo
        }
      })
      return purchases.sort((p1: any, p2: any) => p2.time.seconds - p1.time.seconds)
    })
  }, [state.archivedPurchases, state.stores])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleRetreive = () => {
    try{
      const id = monthlyTrans[lastMonth.current]?.id
      if (!id) {
        throw new Error('noMoreArchive')
      }
      const purchases = getArchivedPurchases(id)
      if (purchases.length > 0) {
        dispatch({type: 'ADD_ARCHIVED_PURCHASES', payload: purchases})
      }
      lastMonth.current++
  } catch(err) {
      setError(getMessage(f7.views.current.router.currentRoute.path, err))
    }
  }

  return(
    <Page>
      <Navbar title={labels.archivedPurchases} backLink={labels.back}>
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
        {purchases.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : purchases.map((p: any) => 
              <ListItem
                link={`/purchase-details/${p.id}/type/a`}
                title={p.storeInfo.name}
                subtitle={moment(p.time.toDate()).fromNow()}
                after={(p.total / 100).toFixed(2)}
                key={p.id}
              />
            )
          }
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleRetreive()}>
        <Icon material="cached"></Icon>
      </Fab>
      <Toolbar bottom>
        <Footer/>
      </Toolbar>
    </Page>
  )
}

export default ArchivedPurchases