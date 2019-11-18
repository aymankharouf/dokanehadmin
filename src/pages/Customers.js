import React, { useContext, useMemo } from 'react'
import {Page, Navbar, Block, Toolbar, List, ListItem} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';


const Customers = props => {
  const { state } = useContext(StoreContext)
  const sections = useMemo(() => {
    let sections = [
      {id: 'p', name: state.labels.forgetPasswords, path: '/forgetPassword/'},
      {id: 'u', name: state.labels.newUsers, path: '/newUsers/'},
      {id: 'a', name: state.labels.allCustomers, path: '/customersList/a'},
    ]
    state.customerTypes.forEach(t => {
      sections.push({
        id: t.id,
        name: t.name,
        path: `/customersList/${t.id}`
      })
    })
    return sections
  }, [state.customerTypes, state.labels])
  const forgetPassword = useMemo(() => state.forgetPassword.filter(f => f.resolved === false)
  , [state.forgetPassword])
  const newUsers = useMemo(() => state.users.filter(u => !state.customers.find(c => c.id === u.id))
  , [state.users, state.customers])
  let i = 0
  return (
    <Page>
      <Navbar title={state.labels.customers} backLink={state.labels.back} />
      <Block>
        <List>
          {sections.map(s => {
            const customers = state.customers.filter(c => s.id === 'a' ? true : c.type === s.id)
            return (
              <ListItem 
                title={s.name} 
                badge={s.id === 'p' ? forgetPassword.length : s.id === 'u' ? newUsers.length : customers.length} 
                badgeColor={state.randomColors[i++ % 10].name} 
                link={s.path}
                key={s.id}
              />
            )
          })}
        </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar />
      </Toolbar>

    </Page>
  )
}

export default Customers
