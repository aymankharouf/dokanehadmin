import React, { useContext } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/Store';


const OrdersList = props => {
  const { state, orders, currentUser } = useContext(StoreContext)
  const userOrders = orders.filter(order => order.user === currentUser.uid)
  userOrders.sort((ordera, orderb) => orderb.time.seconds - ordera.time.seconds)
  return(
    <Page>
      <Navbar title="Orders" backLink="Back" />
      <Block>
          <List mediaList>
            {userOrders && userOrders.map(order =>
              <ListItem
                link={`/order/${order.id}`}
                title={moment(order.time.toDate()).fromNow()}
                after={parseFloat(order.total).toFixed(3)}
                text={state.orderStatus.find(orderStatus => orderStatus.id === order.status).name}
                key={order.id}
              >
              </ListItem>
            )}
            { userOrders.length === 0 ? <ListItem title={state.labels.not_found} /> : null }

          </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default OrdersList
