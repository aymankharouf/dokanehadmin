import React, { useContext, useState, useEffect } from 'react'
import { Block, Page, Navbar, Toolbar, Button} from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { randomColors } from '../data/config'

const Approvals = props => {
  const { state } = useContext(StoreContext)
  const [newOrders, setNewOrders] = useState([])
  const [orderRequests, setOrderRequests] = useState([])
  const [newUsers, setNewUsers] = useState([])
  const [alarms, setAlarms] = useState([])
  const [passwordRequests, setPasswordRequests] = useState([])
  const [ratings, setRatings] = useState([])
  const [invitations, setInvitations] = useState([])
  const [debitRequests, setDebitRequests] = useState([])
  const [sections, setSections] = useState([])
  const [newOwners, setNewOwners] = useState([])
  useEffect(() => {
    setNewOrders(() => state.orders.filter(o => o.status === 'n'))
    setOrderRequests(() => state.orders.filter(r => r.requestStatus === 'n'))
  }, [state.orders])
  useEffect(() => {
    setNewUsers(() => state.users.filter(u => !state.customers.find(c => c.id === u.id)))
    setAlarms(() => state.users.filter(u => u.alarms?.find(i => i.status === 'n')))
    setRatings(() => state.users.filter(u => u.ratings?.find(r => r.status === 'n')))
    setInvitations(() => state.users.filter(u => u.invitations?.find(i => i.status === 'n')))
    setDebitRequests(() => state.users.filter(u => u.debitRequestStatus === 'n'))
    setNewOwners(() => state.customers.filter(c => c.storeName && !c.storeId))
  }, [state.users, state.customers])
  useEffect(() => {
    setPasswordRequests(() => state.passwordRequests.filter(r => r.status === 'n'))
  }, [state.passwordRequests]) 
  useEffect(() => {
    setSections(() => [
      {id: '1', name: 'الطلبات', path: '/orders-list/n', count: newOrders.length},
      {id: '2', name: 'تعديل الطلبات', path: '/order-requests/', count: orderRequests.length},
      {id: '3', name: 'المستخدمين', path: '/new-users/', count: newUsers.length},
      {id: '4', name: 'الاشعارات', path: '/alarms/', count: alarms.length},
      {id: '5', name: 'طلبات كلمة السر', path: '/password-requests/', count: passwordRequests.length},
      {id: '6', name: 'التقييمات', path: '/ratings/', count: ratings.length},
      {id: '7', name: 'الدعوات', path: '/invitations/', count: invitations.length},
      {id: '8', name: 'الدفع لاحقا', path: '/debit-requests/', count: debitRequests.length},
      {id: '9', name: 'اصحاب المحلات', path: '/permission-list/n', count: newOwners.length},
    ])
  }, [newOrders, newUsers, alarms, passwordRequests, ratings, orderRequests, invitations, debitRequests, newOwners])
  let i = 0
  return(
    <Page>
      <Navbar title={labels.approvals} backLink={labels.back} />
      <Block>
        {sections.map(s => 
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
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Approvals
