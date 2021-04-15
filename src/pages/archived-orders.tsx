import { useContext, useState, useEffect, useRef } from 'react'
import { f7, Page, Block, Navbar, List, ListItem, NavRight, Searchbar, Link, Fab, Icon, Toolbar } from 'framework7-react'
import Footer from './footer'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { orderStatus } from '../data/config'
import { getArchivedOrders, getMessage, showError } from '../data/actions'

const ArchivedOrders = () => {
  const { state, dispatch } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [orders, setOrders] = useState<any>([])
  const [monthlyTrans] = useState(() => [...state.monthlyTrans.sort((t1: any, t2: any) => t2.id - t1.id)])
  const lastMonth = useRef(0)
  useEffect(() => {
    setOrders(() => {
      const orders = state.archivedOrders.map((o: any) => {
        const customerInfo = state.customers.find((c: any) => c.id === o.userId)
        const statusInfo = orderStatus.find(s => s.id === o.status)
        return {
          ...o,
          customerInfo,
          statusInfo
        }
      })
      return orders.sort((o1: any, o2: any) => o2.time.seconds - o1.time.seconds)  
    })
  }, [state.archivedOrders, state.customers])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleRetreive = () => {
    try{
      const id = monthlyTrans[lastMonth.current]?.id
      if (!id) {
        throw new Error('noMoreArchive')
      }
      const orders = getArchivedOrders(id)
      if (orders.length > 0) {
        dispatch({type: 'ADD_ARCHIVED_ORDERS', payload: orders})
      }
      lastMonth.current++
  } catch(err) {
      setError(getMessage(f7.views.current.router.currentRoute.path, err))
    }
  }
  return(
    <Page>
      <Navbar title={labels.archivedOrders} backLink={labels.back}>
      <NavRight>
          <Link searchbarEnable=".searchbar" iconMaterial="search"></Link>
        </NavRight>
        <Searchbar
          className="searchbar"
          searchContainer=".search-list"
          searchIn=".item-inner"
          clearButton
          expandable
          placeholder={labels.search}
        />
      </Navbar>
      <Block>
        <List className="searchbar-not-found">
          <ListItem title={labels.noData} />
        </List>
        <List mediaList className="search-list searchbar-found">
          {orders.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : orders.map((o: any) => 
              <ListItem
                link={`/order-details/${o.id}/type/a`}
                title={o.customerInfo.name}
                subtitle={o.statusInfo.name}
                text={moment(o.time.toDate()).fromNow()}
                key={o.id}
              />
            )
          }
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleRetreive()}>
        <Icon material="cached"></Icon>
      </Fab>
      <Toolbar bottom>
        <Footer/>
      </Toolbar>
    </Page>
  )
}

export default ArchivedOrders
