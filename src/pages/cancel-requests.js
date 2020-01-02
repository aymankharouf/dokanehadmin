import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { orderStatus } from '../data/config'

const CancelRequests = props => {
  const { state } = useContext(StoreContext)
  const cancelRequests = useMemo(() => {
    let requests = state.cancelRequests.filter(o => o.status === 'n')
    requests = requests.map(r => {
      const userInfo = state.users.find(u => u.id === r.order.userId)
      const customerInfo = state.customers.find(c => c.id === r.userId)
      const orderStatusInfo = orderStatus.find(s => s.id === r.order.status)
      return {
        ...r,
        userInfo,
        customerInfo,
        orderStatusInfo
      }
    })
    return requests.sort((o1, o2) => o2.time.seconds - o1.time.seconds)
  }, [state.cancelRequests, state.users, state.customers])
  return(
    <Page>
      <Navbar title={labels.cancelOrders} backLink={labels.back} />
      <Block>
        <List mediaList>
          {cancelRequests.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : cancelRequests.map(r => 
              <ListItem
                link={`/cancel-request/${r.order.id}/request/${r.id}`}
                title={r.customerInfo.fullName || `${r.userinfo.name}:${r.userinfo.mobile}`}
                subtitle={r.orderStatusInfo.name}
                text={moment(r.time.toDate()).fromNow()}
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

export default CancelRequests
