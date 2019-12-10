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
      <Navbar title={state.labels.prepareOrders} backLink={state.labels.back} />
      <Block>
        <List mediaList>
          {orders && orders.map(o => {
            const userInfo = state.users.find(u => u.id === o.userId)
            return (
              <ListItem
                title={`${userInfo.name} - ${userInfo.mobile}`}
                after={(o.total / 1000).toFixed(3)}
                subtitle={moment(o.time.toDate()).fromNow()}
                text={o.statusTime ? moment(o.statusTime.toDate()).fromNow() : ''}
                key={o.id}
              >
                {o.withDelivery ? <Badge slot="subtitle" color="red">{state.labels.withDelivery}</Badge> : ''}
              </ListItem>
            )
          }
          )}
          {orders.length === 0 ? <ListItem title={state.labels.noData} /> : ''}
        </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default PrepareOrdersList
