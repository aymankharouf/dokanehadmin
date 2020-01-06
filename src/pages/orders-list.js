import React, { useContext, useMemo, useState, useEffect } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, NavRight, Searchbar, Link, Popover, Button } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { orderStatus, orderPositions } from '../data/config'
import { archiveOrder, showMessage, getMessage, showError } from '../data/actions'

const OrdersList = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [currentOrder, setCurrentOrder] = useState('')
  const status = useMemo(() => orderStatus.find(s => s.id === props.id)
  , [props.id])
  const orders = useMemo(() => {
    let orders = state.orders.filter(o => o.status === props.id)
    orders = orders.map(o => {
      const userInfo = state.users.find(u => u.id === o.userId)
      const customerInfo = state.customers.find(c => c.id === o.userId)
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
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])

  const handleArchive = order => {
    f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, async () => {
      try{
        const year = (order.time.toDate()).getFullYear()
        const month = (order.time.toDate()).getMonth() + 1
        if (!state.monthlyTrans.find(t => t.id === year * 100 + month)) {
          throw new Error('noArchiveBeforeMothlyTrans')
        }
        await archiveOrder(order)
        showMessage(labels.archiveSuccess)
      } catch(err) {
        setError(getMessage(props, err))
      }
    }) 
  } 
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
                title={o.customerInfo?.fullName || `${o.userInfo?.name}:${o.userInfo?.mobile}`}
                subtitle={o.positionInfo?.name || ''}
                text={moment(o.time.toDate()).fromNow()}
                footer={o.lastUpdate ? moment(o.lastUpdate.toDate()).fromNow() : ''}
                key={o.id}
              >
                {o.withDelivery || o.urgent ? <div className="list-subtext1">{o.withDelivery ? labels.withDeliveryNote : ''} {o.withDelivery && o.urgent ? '/' : ''} {o.urgent ? labels.urgent : ''}</div> : ''}
                {['c', 'r', 'u', 'i', 's', 'd'].includes(props.id) ?
                  <Link slot="after" popoverOpen=".orders-list-menu" iconMaterial="more_vert" onClick={()=> setCurrentOrder(o)}/>
                : <Button slot="after" href={`/order-details/${o.id}/type/n`}>{labels.details}</Button>
                }
              </ListItem>
            )
          }
        </List>
        <Popover className="orders-list-menu">
        <List>
          <ListItem 
            link={`/order-details/${currentOrder.id}/type/n`}
            popoverClose 
            title={labels.details} 
          />
          <ListItem 
            link="#"
            popoverClose 
            title={labels.archive}
            onClick={() => handleArchive(currentOrder)}
          />
          </List>
        </Popover>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default OrdersList
