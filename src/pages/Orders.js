import React, { useContext } from 'react'
import { Block, Page, Navbar, Toolbar, List, ListItem} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';


const Orders = props => {
  const { state } = useContext(StoreContext)
  let i = 0
  return(
    <Page>
      <Navbar title={state.labels.orders} backLink={state.labels.back} />
      <Block>
				<List>
          {state.orderStatus.map(s => {
            const count = state.orders.filter(o => o.status === s.id).length
            return (
              <ListItem 
                title={s.name} 
                badge={count} 
                badgeColor={state.randomColors[i++ % 10].name} 
                link={`/ordersList/${s.id}/`} 
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
