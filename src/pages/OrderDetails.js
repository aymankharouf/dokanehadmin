import React, { useContext, useState } from 'react'
import { editOrder } from '../data/Actions'
import { Block, Page, Navbar, List, ListItem, Toolbar, ListInput, Button} from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import ReLogin from './ReLogin'
import { StoreContext } from '../data/Store';


const OrderDetails = props => {
  const { state, orders, currentUser, dispatch } = useContext(StoreContext)
  const order = orders.find(order => order.id === props.id)
  const [error, setError] = useState('')
  const handleEdit = () => {
    if (state.basket.length > 0) {
      setError('your basket must be empty')
      return
    }
    editOrder(order).then(() => {
      dispatch({type: 'LOAD_BASKET', order})
      props.f7router.navigate('/basket/')
    })
  }


  if (!currentUser) return <ReLogin callingPage="order"/>
  return(
    <Page>
      <Navbar title="Order" backLink="Back" />
      <Block>
          <List>
            {order.basket && order.basket.map(product => {
              return (
                <ListItem key={product.id} title={product.name} after={parseFloat(product.netPrice).toFixed(3)}></ListItem>
              )
            })}
            <ListItem title="Total" className="total" after={(parseFloat(order.total) - 0.250).toFixed(3)}></ListItem>
            <ListItem title="Delivery" className="delivery" after="0.250"></ListItem>
            <ListItem title="Net Total" className="net" after={parseFloat(order.total).toFixed(3)}></ListItem>
            <ListInput
              label="Note"
              type="textarea"
              inputId="note"
              value={order.note}
              readonly
            />
            { order.status === 1 ? <Button fill onClick={() => handleEdit()}>Edit</Button> : null }
          </List>
      </Block>
      <Block strong className="error">
        <p>{error}</p>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}
export default OrderDetails
