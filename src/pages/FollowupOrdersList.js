import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Badge } from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/Store';


const FollowupOrdersList = props => {
  const { state } = useContext(StoreContext)
  const orders = useMemo(() => state.orders.filter(o => o.position === props.id)
  , [state.orders, props.id])
  return(
    <Page>
      <Navbar title={`${state.labels.followupOrders} - ${state.orderPositions.find(p => p.id === props.id).name}`} backLink={state.labels.back} />
      <Block>
        <List mediaList>
          {orders && orders.map(o => {
            const userInfo = state.users.find(u => u.id === o.userId)
            return (
              <ListItem
                link={`/followupOrderDetails/${o.id}`}
                title={`${userInfo.name} - ${userInfo.mobile}`}
                after={(o.total / 1000).toFixed(3)}
                subtitle={state.orderStatus.find(s => s.id === o.status).name}
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

export default FollowupOrdersList
