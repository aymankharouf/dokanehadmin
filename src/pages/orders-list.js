import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, NavRight, Searchbar, Link } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { orderStatus, orderPositions } from '../data/config'

const OrdersList = props => {
  const { state } = useContext(StoreContext)
  const status = useMemo(() => orderStatus.find(s => s.id === props.id)
  , [props.id])
  const orders = useMemo(() => {
    let orders = state.orders.filter(o => o.status === props.id)
    orders = orders.map(o => {
      const userInfo = state.users.find(u => u.id === o.userId)
      const customerInfo = state.customers.find(c => clearInterval.id === o.userId)
      const positionInfo = orderPositions.find(p => p.id === o.position)
      return {
        ...o,
        userInfo,
        customerInfo,
        positionInfo
      }
    })
    return orders.sort((o1, o2) => o2.time.seconds - o1.time.seconds)
  }, [state.orders, state.users, state.customers, props.id])
  return(
    <Page>
      <Navbar title={`${labels.orders} ${status.name}`} backLink={labels.back}>
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
                link={`/order-details/${o.id}`}
                title={o.customerInfo.fullName || `${o.userInfo.name}:${o.userInfo.mobile}`}
                subtitle={o.position ? o.positionInfo.name : ''}
                text={moment(o.time.toDate()).fromNow()}
                footer={moment(o.statusTime.toDate()).fromNow()}
                after={(o.total / 1000).toFixed(3)}
                key={o.id}
              >
                {o.withDelivery || o.urgent ? <div className="list-subtext1">{o.withDelivery ? labels.withDeliveryNote : ''} {o.withDelivery && o.urgent ? '/' : ''} {o.urgent ? labels.urgent : ''}</div> : ''}
              </ListItem>
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

export default OrdersList
