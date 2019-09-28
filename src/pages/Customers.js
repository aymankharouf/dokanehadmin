import React, { useContext } from 'react'
import {Page, Navbar, Block, Toolbar, List, ListItem} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';


const Customers = props => {
  const { state } = useContext(StoreContext)
  let sections = [
    {id: 'f', name: state.labels.forgetPasswords, path: '/forgetPassword/'},
    {id: 'u', name: state.labels.newUsers, path: '/newUsers/'},
    {id: 'a', name: state.labels.allCustomers, path: '/customersList/a'},
  ]
  state.customerTypes.forEach(rec => {
    sections.push({
      id: rec.id,
      name: rec.name,
      path: `/customersList/${rec.id}`
    })
  })
  const forgetPassword = state.forgetPassword.filter(rec => rec.resolved === false)
  const newUsers = state.users.filter(rec => rec.isActive === false)
  let i = 0
  return (
    <Page>
      <Navbar title={state.labels.customers} backLink="Back" />
      <Block>
        <List>
          {sections.map(section => {
            const customers = state.customers.filter(rec => section.id === 'a' ? true : rec.type === section.id)
            return (
              <ListItem 
                title={section.name} 
                badge={section.id === 'f' ? forgetPassword.length : section.id === 'u' ? newUsers.length : customers.length} 
                badgeColor={state.randomColors[i++ % 13].name} 
                link={section.path}
                key={section.id}
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
