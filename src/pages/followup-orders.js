import React, { useContext, useState, useEffect } from 'react'
import { Block, Page, Navbar, Toolbar, Button} from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { randomColors, orderPositions } from '../data/config'


const FollowupOrders = props => {
  const { state } = useContext(StoreContext)
  const [positions, setPositions] = useState([])
  useEffect(() => {
    setPositions(() => orderPositions.map(p => {
      const orders = state.orders.filter(o => o.position === p.id)
      return {
        ...p,
        orders
      }
    }))
  }, [state.orders])
  let i = 0
  return(
    <Page>
      <Navbar title={labels.followupOrders} backLink={labels.back} />
      <Block>
        {positions.map(p => 
          <Button
            text={`${p.name} ${p.orders.length > 0 ? '(' + p.orders.length + ')' : ''}`}
            large 
            fill 
            className="sections" 
            color={randomColors[i++ % 10].name} 
            href={`/followup-orders-list/${p.id}`} 
            key={p.id}
          />
        )}
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default FollowupOrders
