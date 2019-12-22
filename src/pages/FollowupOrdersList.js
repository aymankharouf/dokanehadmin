import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar } from 'framework7-react'
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
      <Navbar title={`${state.labels.followupOrders} ${state.orderPositions.find(p => p.id === props.id).name}`} backLink={state.labels.back} />
      <Block>
        <List mediaList>
          {orders.length === 0 ? 
            <ListItem title={state.labels.noData} /> 
          : orders.map(o => {
              const userInfo = state.users.find(u => u.id === o.userId)
              console.log('o.withDelivery == ', o.withDelivery)
              return (
                <ListItem
                  link={`/followupOrderDetails/${o.id}`}
                  title={`${state.labels.user}: ${userInfo.name}`}
                  subtitle={`${state.labels.mobile}: ${userInfo.mobile}`}
                  text={`${state.labels.status}: ${state.orderStatus.find(s => s.id === o.status).name}`}
                  footer={o.statusTime ? moment(o.statusTime.toDate()).fromNow() : ''}
                  after={(o.total / 1000).toFixed(3)}
                  key={o.id}
                >
                  {o.withDelivery ? <div className="list-subtext1">{state.labels.withDeliveryNote}</div> : ''}
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

export default FollowupOrdersList
