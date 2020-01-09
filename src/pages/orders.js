import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, Toolbar, List, ListItem } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import ReLogin from './relogin'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { randomColors, orderStatus } from '../data/config'


const Orders = props => {
  const { state, user } = useContext(StoreContext)
  const orderStatuses = useMemo(() => orderStatus.map(s => {
    const orders = state.orders.filter(o => o.status === s.id)
    return {
      ...s,
      orders
    }
  }), [state.orders])
  let i = 0
  if (!user) return <ReLogin />
  return(
    <Page>
      <Navbar title={labels.orders} backLink={labels.back} />
      <Block>
				<List>
          {orderStatuses.map(s => 
            <ListItem 
              link={`/orders-list/${s.id}/`} 
              title={s.name} 
              badge={s.orders.length} 
              badgeColor={randomColors[i++ % 10].name} 
              key={s.id}
            />
          )}
          <ListItem 
            link="/archived-orders/" 
            title={labels.archived} 
          />
				</List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Orders
