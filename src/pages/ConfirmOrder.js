import React, { useContext, useState } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, ListInput, Button} from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import ReLogin from './ReLogin'
import { StoreContext } from '../data/Store';
import { confirmOrder } from '../data/Actions'


const ConfirmOrder = props => {
  const { state, currentUser, dispatch } = useContext(StoreContext)
  const totalPrice = state.basket.reduce((a, product) => a + Number(product.netPrice), 0)
  /*componentDidUpdate(){
    if (this.props.result.finished && this.props.result.message === '') this.$f7router.navigate('/home/')
  }*/
  const [note, setNote] = useState('')
  const handleOrder = e => {
    const order = {
      note: note,
      basket: state.basket,
      total: (parseFloat(totalPrice) + 0.25).toFixed(3)
    }
    confirmOrder(order).then(() => {
      props.f7router.navigate('/home/')
      dispatch({type: 'CLEAR_BASKET'})
    })
  }
  if (!currentUser) return <ReLogin callingPage="order"/>
  return(
    <Page>
    <Navbar title="Order" backLink="Back" />
    <Block>
        <List>
          {state.basket && state.basket.map(product => {
            return (
              <ListItem key={product.id} title={product.name} after={parseFloat(product.netPrice).toFixed(3)}></ListItem>
            )
          })}
          <ListItem title="Total" className="total" after={parseFloat(totalPrice).toFixed(3)}></ListItem>
          <ListItem title="Delivery" className="delivery" after="0.250"></ListItem>
          <ListItem title="Net Total" className="net" after={(parseFloat(totalPrice) + 0.250).toFixed(3)}></ListItem>
          <ListInput
            label="Note"
            type="textarea"
            inputId="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <Button fill onClick={() => handleOrder()}>Confirm</Button>
        </List>
    </Block>
    <Toolbar bottom>
      <BottomToolbar/>
    </Toolbar>
  </Page>
  )
}
export default ConfirmOrder
