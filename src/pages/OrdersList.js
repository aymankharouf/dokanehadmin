import React, { useContext } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, FabButtons, FabButton, Icon} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/Store';


const OrdersList = props => {
  const { state, orders, users } = useContext(StoreContext)
  const status = state.orderStatus.find(rec => rec.id === props.id)
  let statusOrders = orders.filter(rec => rec.status === props.id)
  statusOrders.sort((ordera, orderb) => orderb.time.seconds - ordera.time.seconds)
  const handleConfirm = () => {
    props.f7router.navigate('/requestedProducts/')
  }
  return(
    <Page>
      <Navbar title={`Orders - ${status.name}`} backLink="Back" />
      <Block>
          <List mediaList>
            {statusOrders && statusOrders.map(order => {
              return (
                <ListItem
                  link={`/order/${order.id}`}
                  title={moment(order.time.toDate()).fromNow()}
                  after={order.total}
                  text={users.find(rec => rec.id === order.user).name}
                  key={order.id}
                >
                </ListItem>
              )}
            )}
            { statusOrders.length === 0 ? <ListItem title={state.labels.not_found} /> : null }
          </List>
      </Block>
      <Fab position="right-bottom" slot="fixed" color="orange">
        <Icon ios="f7:chevron_up" aurora="f7:chevron_up" md="material:keyboard_arrow_up"></Icon>
        <Icon ios="f7:close" aurora="f7:close" md="material:close"></Icon>
        <FabButtons position="top">
          <FabButton color="green" onClick={() => handleConfirm()}>
            <Icon ios="f7:check" aurora="f7:check" md="material:done"></Icon>
          </FabButton>
        </FabButtons>
      </Fab>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default OrdersList
