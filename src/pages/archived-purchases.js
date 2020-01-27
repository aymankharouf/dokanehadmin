import React, { useContext, useState, useEffect } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, NavRight, Searchbar, Link } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { getArchivedPurchases, getMessage, showError } from '../data/actions'

const ArchivedPurchases = props => {
  const { state, dispatch } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [purchases, setPurchases] = useState([])
  useEffect(() => {
    const retreivePurchases = async () => {
      try{
        setInprocess(true)
        const purchases = await getArchivedPurchases()
        setInprocess(false)
        if (purchases.length > 0) {
          dispatch({type: 'SET_ARCHIVED_PURCHASES', purchases})
        }
      } catch(err) {
        setInprocess(false)
        setError(getMessage(props, err))
      }
    }
    if (state.archivedPurchases.length === 0) retreivePurchases()
  })
  useEffect(() => {
    setPurchases(() => {
      const purchases = state.archivedPurchases.map(p => {
        const storeInfo = state.stores.find(s => s.id === p.storeId)
        return {
          ...p,
          storeInfo
        }
      })
      return purchases.sort((p1, p2) => p2.time.seconds - p1.time.seconds)
    })
  }, [state.archivedPurchases, state.stores])
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

  return(
    <Page>
      <Navbar title={labels.archivedPurchases} backLink={labels.back}>
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
        {purchases.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : purchases.map(p => 
              <ListItem
                link={`/purchase-details/${p.id}/type/a`}
                title={p.storeInfo.name}
                subtitle={moment(p.time.toDate()).fromNow()}
                after={((p.total - p.discount) / 1000).toFixed(3)}
                key={p.id}
              />
            )
          }
        </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default ArchivedPurchases
