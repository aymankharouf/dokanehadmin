import React, { useContext } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/Store';


const OrdersList = props => {
  const { state, users, orders } = useContext(StoreContext)
  const status = state.orderStatus.find(rec => rec.id === props.id)
  let statusOrders = orders.filter(rec => rec.status === props.id)
  statusOrders.sort((ordera, orderb) => orderb.time.seconds - ordera.time.seconds)
  return(
    <Page>
      <Navbar title={`${state.labels.orders} - ${status.name}`} backLink="Back" />
      <Block>
          <List mediaList>
            {statusOrders && statusOrders.map(order => 
              <ListItem
                link={`/order/${order.id}`}
                title={users.find(rec => rec.id === order.user).name}
                after={(order.total / 1000).toFixed(3)}
                text={moment(order.time.toDate()).fromNow()}
                key={order.id}
              />
            )}
            { statusOrders.length === 0 ? <ListItem title={state.labels.noData} /> : null }
          </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default OrdersList
