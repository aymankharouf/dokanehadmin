import React, { useContext, useState, useEffect } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, NavRight, Searchbar, Link } from 'framework7-react'
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
  const [inprocess, setInprocess] = useState(false)
  const [orders, setOrders] = useState([])
  useEffect(() => {
    const retreiveOrders = async () => {
      try{
        setInprocess(true)
        const orders = await getArchivedOrders()
        setInprocess(false)
        if (orders.length > 0) {
          dispatch({type: 'SET_ARCHIVED_ORDERS', orders})
        }
      } catch(err) {
        setInprocess(false)
        setError(getMessage(props, err))
      }
    }
    if (state.archivedOrders.length === 0) retreiveOrders()
  })
  useEffect(() => {
    setOrders(() => {
      const orders = state.archivedOrders.map(o => {
        const customerInfo = state.customers.find(c => c.id === o.userId)
        const statusInfo = orderStatus.find(s => s.id === o.status)
        return {
          ...o,
          customerInfo,
          statusInfo
        }
      })
      return orders.sort((o1, o2) => o2.activeTime.seconds - o1.activeTime.seconds)  
    })
  }, [state.archivedOrders, state.customers])
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
      <Navbar title={labels.archivedOrders} backLink={labels.back}>
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
                title={o.customerInfo.fullName}
                subtitle={o.statusInfo.name}
                text={moment(o.activeTime.toDate()).fromNow()}
                key={o.id}
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

export default ArchivedOrders
