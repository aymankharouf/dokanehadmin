import { useContext, useState, useEffect } from 'react'
import { Page, Block, Navbar, Button, Toolbar } from 'framework7-react'
import Footer from './footer'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { randomColors } from '../data/config'

const Approvals = () => {
  const { state } = useContext(StoreContext)
  const [newOrders, setNewOrders] = useState([])
  const [orderRequests, setOrderRequests] = useState([])
  const [newUsers, setNewUsers] = useState([])
  const [alarms, setAlarms] = useState([])
  const [passwordRequests, setPasswordRequests] = useState([])
  const [ratings, setRatings] = useState([])
  const [invitations, setInvitations] = useState([])
  const [sections, setSections] = useState<any>([])
  const [newOwners, setNewOwners] = useState([])
  const [notifyFriends, setNotifyFriends] = useState([])
  useEffect(() => {
    setNewOrders(() => state.orders.filter((o: any) => o.status === 'n'))
    setOrderRequests(() => state.orders.filter((r: any) => r.requestType))
  }, [state.orders])
  useEffect(() => {
    setNewUsers(() => state.users.filter((u: any) => !state.customers.find((c: any) => c.id === u.id)))
    setAlarms(() => state.alarms.filter((a: any) => a.status === 'n'))
    setRatings(() => state.ratings.filter((r: any) => r.status === 'n'))
    setInvitations(() => state.invitations.filter((i: any) => i.status === 'n'))
    setNewOwners(() => state.customers.filter((c: any) => c.storeName && !c.storeId))
    setNotifyFriends(() => state.users.filter((u: any) => u.notifyFriends?.length > 0))
  }, [state.users, state.customers, state.alarms, state.ratings, state.invitations])
  useEffect(() => {
    setPasswordRequests(() => state.passwordRequests)
  }, [state.passwordRequests]) 
  useEffect(() => {
    setSections(() => [
      {id: '1', name: labels.orders, path: '/orders-list/n/type/s', count: newOrders.length},
      {id: '2', name: labels.orderRequests, path: '/order-requests/', count: orderRequests.length},
      {id: '3', name: labels.newUsers, path: '/new-users/', count: newUsers.length},
      {id: '4', name: labels.alarms, path: '/alarms/', count: alarms.length},
      {id: '5', name: labels.passwordRequests, path: '/password-requests/', count: passwordRequests.length},
      {id: '6', name: labels.ratings, path: '/ratings/', count: ratings.length},
      {id: '7', name: labels.invitations, path: '/invitations/', count: invitations.length},
      {id: '8', name: labels.newOwners, path: '/permission-list/n', count: newOwners.length},
      {id: '9', name: labels.notifyFriends, path: '/notify-friends/', count: notifyFriends.length},
    ])
  }, [newOrders, newUsers, alarms, passwordRequests, ratings, orderRequests, invitations, newOwners, notifyFriends])
  let i = 0
  return(
    <Page>
      <Navbar title={labels.approvals} backLink={labels.back} />
      <Block>
        {sections.map((s: any) => 
          <Button 
            text={`${s.name} ${s.count > 0 ? '(' + s.count + ')' : ''}`}
            large 
            fill 
            className="sections" 
            color={randomColors[i++ % 10].name} 
            href={s.path} 
            key={s.id}
          />
        )}
      </Block>
      <Toolbar bottom>
        <Footer/>
      </Toolbar>
    </Page>
  )
}

export default Approvals
