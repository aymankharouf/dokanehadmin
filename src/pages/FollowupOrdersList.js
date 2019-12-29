import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'


const FollowupOrdersList = props => {
  const { state } = useContext(StoreContext)
  const orders = useMemo(() => state.orders.filter(o => o.position === props.id)
  , [state.orders, props.id])
  return(
    <Page>
      <Navbar title={`${labels.followupOrders} ${state.orderPositions.find(p => p.id === props.id).name}`} backLink={labels.back} />
      <Block>
        <List mediaList>
          {orders.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : orders.map(o => {
              const userInfo = state.users.find(u => u.id === o.userId)
              return (
                <ListItem
                  link={`/followupOrderDetails/${o.id}`}
                  title={`${labels.user}: ${userInfo.name}`}
                  subtitle={`${labels.mobile}: ${userInfo.mobile}`}
                  text={`${labels.status}: ${state.orderStatus.find(s => s.id === o.status).name}`}
                  footer={o.statusTime ? moment(o.statusTime.toDate()).fromNow() : ''}
                  after={(o.total / 1000).toFixed(3)}
                  key={o.id}
                >
                  {o.withDelivery ? <div className="list-subtext1">{labels.withDeliveryNote}</div> : ''}
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
