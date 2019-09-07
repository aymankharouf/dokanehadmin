import React, { useContext } from 'react'
import {Page, Navbar, NavLeft, NavTitle, Link, Block, Toolbar, Button} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';


const Customers = props => {
  const { state } = useContext(StoreContext)
  const sections = [
    {id: '1', name: 'نسيان كلمة السر', path: 'forgetPassword'},
  ]

  let i = 0
  return (
    <Page>
      <Navbar title={state.labels.customers} backLink="Back" />
      <Block>
        {sections.map(page => {
          return (
            <Button large fill className="sections" color={state.randomColors[i++ % 13].name} href={`/${page.path}/`} key={page.id}>
              {page.name}
            </Button>
          )
        })}
      </Block>
      <Toolbar bottom>
        <BottomToolbar />
      </Toolbar>

    </Page>
  )
}

export default Customers
