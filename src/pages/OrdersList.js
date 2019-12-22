import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Badge, NavRight, Searchbar, Link } from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/Store';


const OrdersList = props => {
  const { state } = useContext(StoreContext)
  const status = useMemo(() => state.orderStatus.find(s => s.id === props.id)
  , [state.orderStatus, props.id])
  const orders = useMemo(() => {
    const orders = state.orders.filter(o => o.status === props.id)
    return orders.sort((o1, o2) => o2.time.seconds - o1.time.seconds)
  }, [state.orders, props.id])
  return(
    <Page>
      <Navbar title={`${state.labels.orders} ${status.name}`} backLink={state.labels.back}>
      <NavRight>
          <Link searchbarEnable=".searchbar" iconMaterial="search"></Link>
        </NavRight>
        <Searchbar
          className="searchbar"
          searchContainer=".search-list"
          searchIn=".item-title, .item-subtitle"
          clearButton
          expandable
          placeholder={state.labels.search}
        />
      </Navbar>
      <Block>
        <List className="searchbar-not-found">
          <ListItem title={state.labels.noData} />
        </List>
        <List mediaList className="search-list searchbar-found">
          {orders.length === 0 ? 
            <ListItem title={state.labels.noData} /> 
          : orders.map(o => {
              const userInfo = state.users.find(u => u.id === o.userId)
              return (
                <ListItem
                  link={`/order/${o.id}`}
                  title={`${state.labels.user}: ${userInfo.name}`}
                  after={(o.total / 1000).toFixed(3)}
                  key={o.id}
                >
                  <div className="list-line1">{`${state.labels.mobile}: ${userInfo.mobile}`}</div>
                  {o.position ? <div className="list-line2">{state.orderPositions.find(p => p.id === o.position).name}</div> : ''}
                  <div className="list-line3">{moment(o.time.toDate()).fromNow()}</div>
                  {o.statusTime ? <div className="list-line4">{moment(o.statusTime.toDate()).fromNow()}</div> : ''}
                  {o.withDelivery ? 
                    <Badge slot="subtitle" color="red">{state.labels.withDelivery}</Badge> 
                  : ''}
                </ListItem>
              )
            })
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
