import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Badge } from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/Store';


const PrepareOrdersList = props => {
  const { state } = useContext(StoreContext)
  const orders = useMemo(() => {
    const orders = state.orders.filter(o => props.orderId ? o.id === props.orderId : o.status === 'f' && o.basket.find(p => p.id === props.packId))
    return orders.sort((o1, o2) => o2.time.seconds - o1.time.seconds)
  }, [state.orders, props.orderId, props.packId])
  return(
    <Page>
      <Navbar title={state.labels.prepareOrders} backLink={state.labels.back} className="page-title" />
      <Block>
        <List mediaList>
          {orders.length === 0 ? 
            <ListItem title={state.labels.noData} /> 
          : orders.map(o => {
              const userInfo = state.users.find(u => u.id === o.userId)
              return (
                <ListItem
                  title={`${state.labels.user}: ${userInfo.name}`}
                  after={(o.total / 1000).toFixed(3)}
                  key={o.id}
                >
                  <div className="list-line1">{`${state.labels.mobile}: ${userInfo.mobile}`}</div>
                  <div className="list-line2">{moment(o.time.toDate()).fromNow()}</div>
                  {o.statusTime ? <div className="list-line3">{moment(o.statusTime.toDate()).fromNow()}</div> : ''}
                  {o.withDelivery ? <Badge slot="subtitle" color="red">{state.labels.withDelivery}</Badge> : ''}
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

export default PrepareOrdersList
