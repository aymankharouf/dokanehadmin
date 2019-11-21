import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, Toolbar, Button} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';


const Approvals = props => {
  const { state } = useContext(StoreContext)
  const newOrders = useMemo(() => state.orders.filter(o => o.status === 'n')
  , [state.orders])
  const newUsers = useMemo(() => state.users.filter(u => !state.customers.find(c => c.id === u.id))
  , [state.users, state.customers])
  const priceAlarms = useMemo(() => state.priceAlarms.filter(a => a.status === 'n')
  , [state.priceAlarms])
  const forgetPassword = useMemo(() => state.forgetPassword.filter(f => f.resolved === false)
   , [state.forgetPassword])
   const ratings = useMemo(() => state.ratings.filter(r => r.status === 'n')
  , [state.ratings])
  const sections = useMemo(() => [
    {id: '1', name: 'الطلبات', path: '/ordersList/n', count: newOrders.length},
    {id: '2', name: 'المستخدمين', path: '/newUsers/', count: newUsers.length},
    {id: '3', name: 'اشعارات الاسعار', path: '/priceAlarms/', count: priceAlarms.length},
    {id: '4', name: 'نسيان كلمة السر', path: '/forgetPassword/', count: forgetPassword.length},
    {id: '5', name: 'التقييمات', path: '/ratings/', count: ratings.length},
  ], [newOrders, newUsers, priceAlarms, forgetPassword, ratings])
  let i = 0
  return(
    <Page>
      <Navbar title={state.labels.approvals} backLink={state.labels.back} />
      <Block>
        {sections.map(s => {
            return (
            <Button large fill className="sections" color={state.randomColors[i++ % 10].name} href={s.path} key={s.id}>
                {`${s.name} ${s.count > 0 ? '(' + s.count + ')' : ''}`}
            </Button>
            )
        })}
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Approvals
