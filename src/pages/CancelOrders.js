import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { orderStatus } from '../data/config'

const CancelOrders = props => {
  const { state } = useContext(StoreContext)
  const cancelOrders = useMemo(() => {
    const cancelOrders = state.cancelOrders.filter(o => o.status === 'n')
    return cancelOrders.sort((o1, o2) => o2.time.seconds - o1.time.seconds)
  }, [state.cancelOrders])
  return(
    <Page>
      <Navbar title={labels.cancelOrders} backLink={labels.back} />
      <Block>
        <List mediaList>
          {cancelOrders.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : cancelOrders.map(o => {
              const userInfo = state.users.find(u => u.id === o.order.userId)
              return (
                <ListItem
                  link={`/cancelOrder/${o.order.id}/cancelOrder/${o.id}`}
                  title={`${labels.user}: ${userInfo.name}`}
                  subtitle={`${labels.mobile}: ${userInfo.mobile}`}
                  text={orderStatus.find(s => s.id === o.order.status).name}
                  footer={moment(o.time.toDate()).fromNow()}
                  after={(o.order.total / 1000).toFixed(3)}
                  key={o.id}
                />
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

export default CancelOrders
