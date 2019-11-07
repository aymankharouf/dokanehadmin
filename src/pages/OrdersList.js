import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/Store';


const OrdersList = props => {
  const { state } = useContext(StoreContext)
  const status = useMemo(() => state.orderStatus.find(rec => rec.id === props.id), [state.orderStatus])
  const orders = useMemo(() => {
    const orders = state.orders.filter(rec => rec.status === props.id)
    return orders.sort((rec1, rec2) => rec2.time.seconds - rec1.time.seconds)
  }, [state.orders])
  return(
    <Page>
      <Navbar title={`${state.labels.orders} - ${status.name}`} backLink={state.labels.back} />
      <Block>
          <List mediaList>
            {orders && orders.map(order => {
              const userInfo = state.users.find(rec => rec.id === order.user)
              return (
                <ListItem
                  link={`/order/${order.id}`}
                  title={`${userInfo.name} - ${userInfo.mobile}`}
                  after={(order.total / 1000).toFixed(3)}
                  subtitle={moment(order.time.toDate()).fromNow()}
                  text={order.statusTime ? moment(order.statusTime.toDate()).fromNow() : ''}
                  key={order.id}
                />
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
