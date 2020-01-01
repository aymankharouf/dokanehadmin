import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, Toolbar, Button} from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { randomColors } from '../data/config'

const Approvals = props => {
  const { state } = useContext(StoreContext)
  const newOrders = useMemo(() => state.orders.filter(o => o.status === 'n')
  , [state.orders])
  const cancelRequests = useMemo(() => state.cancelRequests.filter(o => o.status === 'n')
  , [state.cancelRequests])
  const newUsers = useMemo(() => state.users.filter(u => !state.customers.find(c => c.id === u.id))
  , [state.users, state.customers])
  const priceAlarms = useMemo(() => state.priceAlarms.filter(a => a.status === 'n')
  , [state.priceAlarms])
  const forgetPasswords = useMemo(() => state.forgetPasswords.filter(f => f.resolved === false)
   , [state.forgetPasswords])
   const ratings = useMemo(() => state.ratings.filter(r => r.status === 'n')
  , [state.ratings])
  const invitations = useMemo(() => state.invitations.filter(r => r.status === 'n')
  , [state.invitations])
  const sections = useMemo(() => [
    {id: '1', name: 'الطلبات', path: '/orders-list/n', count: newOrders.length},
    {id: '2', name: 'الغاء الطلبات', path: '/cancel-requests/', count: cancelRequests.length},
    {id: '3', name: 'المستخدمين', path: '/new-users/', count: newUsers.length},
    {id: '4', name: 'اشعارات الاسعار', path: '/price-alarms/', count: priceAlarms.length},
    {id: '5', name: 'نسيان كلمة السر', path: '/forget-passwords/', count: forgetPasswords.length},
    {id: '6', name: 'التقييمات', path: '/ratings/', count: ratings.length},
    {id: '7', name: 'الدعوات', path: '/invitations/', count: invitations.length},
  ], [newOrders, newUsers, priceAlarms, forgetPasswords, ratings, cancelRequests, invitations])
  let i = 0
  return(
    <Page>
      <Navbar title={labels.approvals} backLink={labels.back} />
      <Block>
        {sections.map(s => 
          <Button 
            large 
            fill 
            className="sections" 
            color={randomColors[i++ % 10].name} 
            href={s.path} 
            key={s.id}
          >
            {`${s.name} ${s.count > 0 ? '(' + s.count + ')' : ''}`}
          </Button>
        )}
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Approvals
