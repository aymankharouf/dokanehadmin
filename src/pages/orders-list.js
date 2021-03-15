import { useContext, useState, useEffect } from 'react'
import { Page, Block, Navbar, List, ListItem, NavRight, Searchbar, Link, Toolbar } from 'framework7-react'
import Footer from './footer'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { orderStatus } from '../data/config'

const OrdersList = props => {
  const { state } = useContext(StoreContext)
  const [orders, setOrders] = useState([])
  useEffect(() => {
    setOrders(() => {
      let orders = state.orders.filter(o => (props.type === 's' && o.status === props.id) || (props.type === 'u' && o.userId === props.id))
      orders = orders.map(o => {
        const userInfo = state.users.find(u => u.id === o.userId)
        const customerInfo = state.customers.find(c => c.id === o.userId)
        const statusInfo = orderStatus.find(s => s.id === o.status)
        return {
          ...o,
          userInfo,
          customerInfo,
          statusInfo
        }
      })
      return orders.sort((o1, o2) => o2.time.seconds - o1.time.seconds)
    })
  }, [state.orders, state.users, state.customers, props.id, props.type])

  return(
    <Page>
      <Navbar title={`${labels.orders} ${props.type === 's' ? orderStatus.find(s => s.id === props.id).name : state.customers.find(c => c.id === props.id).name}`} backLink={labels.back}>
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
          {orders.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : orders.map(o => 
              <ListItem
                link={`/order-details/${o.id}/type/n`}
                title={props.type === 's' ? (o.customerInfo?.name || o.userInfo.name) : o.statusInfo.name}
                subtitle={o.deliveryTime}
                text={moment(o.time.toDate()).fromNow()}
                footer={o.lastUpdate ? moment(o.lastUpdate.toDate()).fromNow() : ''}
                after={(o.total / 100).toFixed(2)}
                key={o.id}
              />
            )
          }
        </List>
      </Block>
      <Toolbar bottom>
        <Footer/>
      </Toolbar>
    </Page>
  )
}

export default OrdersList
