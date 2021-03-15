import { useContext, useState, useEffect } from 'react'
import { Page, Block, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import Footer from './footer'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { orderStatus, orderRequestTypes } from '../data/config'

const OrderRequests = () => {
  const { state } = useContext(StoreContext)
  const [orderRequests, setOrderRequests] = useState([])
  useEffect(() => {
    setOrderRequests(() => {
      let requests = state.orders.filter(r => r.requestType)
      requests = requests.map(r => {
        const customerInfo = state.customers.find(c => c.id === r.userId)
        const orderStatusInfo = orderStatus.find(s => s.id === r.status)
        const requestTypeInfo = orderRequestTypes.find(t => t.id === r.requestType)
        return {
          ...r,
          customerInfo,
          orderStatusInfo,
          requestTypeInfo
        }
      })
      return requests.sort((r1, r2) => r2.requestTime.seconds - r1.requestTime.seconds)
    })
  }, [state.orders, state.customers])
  return(
    <Page>
      <Navbar title={labels.orderRequests} backLink={labels.back} />
      <Block>
        <List mediaList>
          {orderRequests.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : orderRequests.map(r => 
              <ListItem
                link={`/order-request-details/${r.id}`}
                title={r.customerInfo.name}
                subtitle={r.orderStatusInfo.name}
                text={`${labels.type}: ${r.requestTypeInfo.name}`}
                footer={moment(r.time.toDate()).fromNow()}
                after={(r.total / 100).toFixed(2)}
                key={r.id}
              />
            )
          }
        </List>
      </Block>
      <Toolbar bottom>
        <Footer/>
      </Toolbar>
    </Page>
  )
}

export default OrderRequests
