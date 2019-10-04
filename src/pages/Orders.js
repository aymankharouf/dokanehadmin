import React, { useContext } from 'react'
import { Block, Page, Navbar, Toolbar, List, ListItem} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';


const Orders = props => {
  const { state } = useContext(StoreContext)
  let i = 0
  return(
    <Page>
      <Navbar sliding title={state.labels.orders} backLink="Back" />
      <Block>
				<List>
          {state.orderStatus.map(status => {
            const count = state.orders.filter(rec => rec.status === status.id).length
            return (
              <ListItem 
                title={status.name} 
                badge={count} 
                badgeColor={state.randomColors[i++ % 13].name} 
                link={`/ordersList/${status.id}/`} 
                key={status.id}
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
