import React, { useContext } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/Store';


const ActiveOrders = props => {
  const { state, orders } = useContext(StoreContext)
  const activeOrders = orders.filter(order => order.status === 1)
  activeOrders.sort((ordera, orderb) => orderb.time.seconds - ordera.time.seconds)
  return(
    <Page>
      <Navbar title="Orders" backLink="Back" />
      <Block>
          <List mediaList>
            {activeOrders && activeOrders.map(order =>
              <ListItem
                link={`/order/${order.id}`}
                title={order.user}
                after={order.total}
                text={moment(order.time.toDate()).fromNow()}
                key={order.id}
              >
              </ListItem>
            )}
            { activeOrders.length === 0 ? <ListItem title={state.labels.not_found} /> : null }

          </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default ActiveOrders
