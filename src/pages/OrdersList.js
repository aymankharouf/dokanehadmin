import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Badge} from 'framework7-react'
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
      <Navbar title={`${state.labels.orders} - ${status.name}`} backLink={state.labels.back} />
      <Block>
          <List mediaList>
            {orders && orders.map(o => {
              const userInfo = state.users.find(u => u.id === o.user)
              const orderNet = o.total + o.fixedFees + o.deliveryFees - o.discount.value
              return (
                <ListItem
                  link={`/order/${o.id}`}
                  title={`${userInfo.name} - ${userInfo.mobile}`}
                  after={(orderNet / 1000).toFixed(3)}
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

export default OrdersList
