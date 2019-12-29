import React, { useContext } from 'react'
import { Block, Page, Navbar, Toolbar, Button} from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { randomColors, orderPositions } from '../data/config'


const FollowupOrders = props => {
  const { state } = useContext(StoreContext)
  let i = 0
  return(
    <Page>
      <Navbar title={labels.followupOrders} backLink={labels.back} />
      <Block>
        {orderPositions.map(p => {
          const orders = state.orders.filter(o => o.position === p.id)
          return (
            <Button 
              large 
              fill 
              className="sections" 
              color={randomColors[i++ % 10].name} 
              href={`/FollowupOrdersList/${p.id}`} 
              key={p.id}
            >
              {`${p.name} ${orders.length > 0 ? '(' + orders.length + ')' : ''}`}
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

export default FollowupOrders
