import React, { useContext, useState, useEffect, useRef } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, NavRight, Searchbar, Link, Fab, Icon } from 'framework7-react'
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
  const [monthlyTrans] = useState(() => [...state.monthlyTrans.sort((t1, t2) => t2.id - t1.id)])
  const lastMonth = useRef(0)
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
  const handleRetreive = async () => {
    try{
      const id = monthlyTrans[lastMonth.current]?.id
      if (!id) {
        throw new Error('noMoreArchive')
      }
      setInprocess(true)
      const orders = await getArchivedOrders(id)
      setInprocess(false)  
      if (orders.length > 0) {
        dispatch({type: 'ADD_ARCHIVED_ORDERS', orders})
      }
      lastMonth.current++
  } catch(err) {
      setInprocess(false)
      setError(getMessage(props, err))
    }
  }
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
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleRetreive()}>
        <Icon material="cached"></Icon>
      </Fab>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default ArchivedOrders
