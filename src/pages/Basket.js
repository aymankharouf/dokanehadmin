import React, { useContext } from 'react'
import { Block, Fab, Page, Navbar, List, ListItem, Toolbar, Link, Icon, Row, Col} from 'framework7-react'
import { StoreContext } from '../data/Store';


const Basket = props => {
  const { state, dispatch } = useContext(StoreContext)
  const totalPrice = state.basket.reduce((a, product) => a + Number(product.netPrice), 0)
  const handleConfirm = e => {
    if (totalPrice > 0) props.f7router.navigate('/confirmOrder/')
  }
  const handleClear = () => {
    dispatch({type: 'CLEAR_BASKET'})
    props.f7router.navigate('/home/')
  }
  return(
    <Page>
    <Navbar title="basket" backLink="Back" />
    <Fab position="left-top" slot="fixed" text="Clear" color="red" onClick={() => handleClear()}>
      <Icon ios="f7:close" aurora="f7:close" md="material:close"></Icon>
    </Fab>
    <Block>
        <List mediaList>
          {state.basket && state.basket.map(product => {
            return (
              <ListItem
                title={product.name}
                after={parseFloat(product.netPrice).toFixed(3)}
                subtitle={product.trademark}
                key={product.id}
              >
                <img slot="media" src={product.imageUrl} width="80" alt=""/>
                <Row noGap>
                  <Col width="60"></Col>
                  <Col width="10">
                    <Link onClick={() => dispatch({type: 'ADD_QUANTITY', product})} iconMaterial="add"></Link>
                  </Col>
                  <Col width="20" className="center">
                    {product.quantity}
                  </Col>
                  <Col width="10">
                    <Link onClick={() => dispatch({type: 'REMOVE_QUANTITY', product})}><Icon material="remove"></Icon></Link>              
                  </Col>
                </Row>
              </ListItem>
            )
          })}
        </List>
    </Block>
    <Toolbar bottom>
      <Link href="#" onClick={(e) => handleConfirm(e)}>Order</Link>
      <p className="total-price">{parseFloat(totalPrice).toFixed(3)}</p>
    </Toolbar>
  </Page>
  )
}
export default Basket
