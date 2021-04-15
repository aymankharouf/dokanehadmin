import { useContext, useState, useEffect } from 'react'
import { f7, Page, Block, Navbar, List, ListItem, Fab, Icon, Toolbar } from 'framework7-react'
import Footer from './footer'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { randomColors, orderStatus } from '../data/config'


const Orders = () => {
  const { state } = useContext(StoreContext)
  const [orderStatuses, setOrderStatuses] = useState<any>([])
  const [orderRequests, setOrderRequests] = useState([])
  const [finishedOrders, setFinishedOrders] = useState([])
  useEffect(() => {
    setOrderStatuses(() => orderStatus.map(s => {
      const orders = state.orders.filter((o: any) => o.status === s.id)
      return {
        ...s,
        orders
      }
    }))
    setOrderRequests(() => state.orders.filter((o: any) => o.requestType))
    setFinishedOrders(() => state.orders.filter((o: any) => o.status === 'f'))
  }, [state.orders])
  let i = 0
  if (!state.user) return <Page><h3 className="center"><a href="/login/">{labels.relogin}</a></h3></Page>
  return(
    <Page>
      <Navbar title={labels.orders} backLink={labels.back} />
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => f7.views.current.router.navigate('/archived-orders/')}>
        <Icon material="backup"></Icon>
      </Fab>
      <Block>
				<List>
          <ListItem 
            link="/order-requests/" 
            title={labels.orderRequests} 
            badge={orderRequests.length} 
            badgeColor={randomColors[i++ % 10].name} 
          />
          <ListItem 
            link="/prepare-orders/" 
            title={labels.prepareOrders} 
            badge={finishedOrders.length} 
            badgeColor={randomColors[i++ % 10].name} 
          />
          {orderStatuses.map((s: any) => 
            <ListItem 
              link={`/orders-list/${s.id}/type/s`} 
              title={s.name} 
              badge={s.orders.length} 
              badgeColor={randomColors[i++ % 10].name} 
              key={s.id}
            />
          )}
				</List>
      </Block>
      <Toolbar bottom>
        <Footer/>
      </Toolbar>
    </Page>
  )
}

export default Orders
