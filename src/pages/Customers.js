import React, { useContext } from 'react'
import {Page, Navbar, Block, Toolbar, List, ListItem} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';


const Customers = props => {
  const { state } = useContext(StoreContext)
  const sections = [
    {id: '1', name: 'نسيان كلمة السر', path: 'forgetPassword'},
  ]
  const forgetPassword = state.forgetPassword.filter(rec => rec.resolved === false)
  let i = 0
  return (
    <Page>
      <Navbar title={state.labels.customers} backLink="Back" />
      <Block>
        <List>
          {sections.map(page => {
            return (
              <ListItem 
                title={page.name} 
                badge={forgetPassword.length} 
                badgeColor={state.randomColors[i++ % 13].name} 
                link={`/${page.path}/`} 
                key={page.id}
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
