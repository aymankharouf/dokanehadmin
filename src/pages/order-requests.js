import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { orderStatus, orderRequestTypes } from '../data/config'

const OrderRequests = props => {
  const { state } = useContext(StoreContext)
  const orderRequests = useMemo(() => {
    let requests = state.orderRequests.filter(r => r.status === 'n')
    requests = requests.map(r => {
      const userInfo = state.users.find(u => u.id === r.order.userId)
      const customerInfo = state.customers.find(c => c.id === r.order.userId)
      const orderStatusInfo = orderStatus.find(s => s.id === r.order.status)
      const requestTypeInfo = orderRequestTypes.find(t => t.id === r.type)
      return {
        ...r,
        userInfo,
        customerInfo,
        orderStatusInfo,
        requestTypeInfo
      }
    })
    return requests.sort((o1, o2) => o2.time.seconds - o1.time.seconds)
  }, [state.orderRequests, state.users, state.customers])
  return(
    <Page>
      <Navbar title={labels.cancelOrders} backLink={labels.back} />
      <Block>
        <List mediaList>
          {orderRequests.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : orderRequests.map(r => 
              <ListItem
                link={`/order-request-details/${r.id}`}
                title={r.customerInfo.fullName || `${r.userinfo.name}:${r.userinfo.mobile}`}
                subtitle={r.orderStatusInfo.name}
                text={r.requestTypeInfo.name}
                footer={moment(r.time.toDate()).fromNow()}
                after={(r.order.total / 1000).toFixed(3)}
                key={r.id}
              />
            )
          }
        </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default OrderRequests
