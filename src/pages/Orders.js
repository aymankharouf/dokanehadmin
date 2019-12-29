import React, { useContext } from 'react'
import { Block, Page, Navbar, Toolbar, List, ListItem } from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { randomColors, orderStatus } from '../data/config'


const Orders = props => {
  const { state } = useContext(StoreContext)
  let i = 0
  return(
    <Page>
      <Navbar title={labels.orders} backLink={labels.back} />
      <Block>
				<List>
          {orderStatus.map(s => {
            const count = state.orders.filter(o => o.status === s.id).length
            return (
              <ListItem 
                link={`/ordersList/${s.id}/`} 
                title={s.name} 
                badge={count} 
                badgeColor={randomColors[i++ % 10].name} 
                key={s.id}
              />
            )
          })}
				</List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Orders
