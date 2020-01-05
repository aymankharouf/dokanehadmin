import React, { useContext, useMemo, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, NavRight, Searchbar, Link, Fab, Icon } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { orderStatus } from '../data/config'
import { getArchivedOrders, getMessage, showError } from '../data/actions'

const ArchivedOrders = props => {
  const { state, dispatch } = useContext(StoreContext)
  const [error, setError] = useState('')
  useEffect(() => {
    const retreiveOrders = async () => {
      try{
        const orders = await getArchivedOrders()
        dispatch({type: 'SET_ARCHIVED_ORDERS', orders})
      } catch(err) {
        setError(getMessage(props, err))
      }
    }
    if (state.archivedOrders.length === 0) retreiveOrders()
  }, [state.archivedOrders, dispatch, props])

  const orders = useMemo(() => {
    const orders = state.archivedOrders.map(o => {
      const customerInfo = state.customers.find(c => c.id === o.userId)
      const statusInfo = orderStatus.find(s => s.id === o.status)
      return {
        ...o,
        customerInfo,
        statusInfo
      }
    })
    return orders.sort((o1, o2) => o2.time.seconds - o1.time.seconds)
  }, [state.archivedOrders, state.customers])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleRefresh = async () => {
    try{
      const orders = await getArchivedOrders()
      dispatch({type: 'SET_ARCHIVED_ORDERS', orders})
    } catch(err) {
      setError(getMessage(props, err))
    }
  }
  return(
    <Page>
      <Navbar title={labels.archived} backLink={labels.back}>
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
          {orders.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : orders.map(o => 
              <ListItem
                link={`/order-details/${o.id}/type/a`}
                title={o.customerInfo?.fullName || `${o.userInfo.name}:${o.userInfo.mobile}`}
                subtitle={o.statusInfo.name}
                text={moment(o.time.toDate()).fromNow()}
                key={o.id}
              />
            )
          }
        </List>
      </Block>
      {state.archivedOrders.length === 0  ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleRefresh()}>
          <Icon material="cached"></Icon>
        </Fab>
      }
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default ArchivedOrders
