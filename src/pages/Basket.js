import React, { useContext, useEffect } from 'react'
import { Block, Fab, Page, Navbar, List, ListItem, Toolbar, Link, Icon, Row, Col} from 'framework7-react'
import { StoreContext } from '../data/Store';


const Basket = props => {
  const { state, orders, dispatch } = useContext(StoreContext)
  const store = state.basket.store ? state.stores.find(rec => rec.id === state.basket.store.id) : null
  const totalPrice = state.basket.products ? parseFloat(state.basket.products.reduce((a, product) => a + Number(product.netPrice), 0)).toFixed(3) : null
  useEffect(() => {
    if (!state.basket.storeId) props.f7router.navigate('/home/')
  }, [state.basket])
  return(
    <Page>
    <Navbar title={`basket from ${store ? store.name: ''}`} backLink="Back" />
    <Block>
        <List mediaList>
          {state.basket.products && state.basket.products.map(product => {
            return (
              <ListItem
                title={product.name}
                after={product.netPrice}
                subtitle={`انتاج ${state.countries.find(rec => rec.id === product.country).name}`}
                key={product.id}
              >
                <img slot="media" src={product.imageUrl} width="80" alt=""/>
                <Row noGap>
                  <Col width="60"></Col>
                  <Col width="10">
                    <Link onClick={() => dispatch({type: 'ADD_QUANTITY', product})}>
                      <Icon ios="f7:chevron_up" aurora="f7:chevron_up" md="material:keyboard_arrow_up"></Icon>                    
                    </Link>
                  </Col>
                  <Col width="20" className="center">
                    {product.quantity}
                  </Col>
                  <Col width="10">
                    <Link onClick={() => dispatch({type: 'REMOVE_QUANTITY', product})}>
                      <Icon ios="f7:chevron_down" aurora="f7:chevron_down" md="material:keyboard_arrow_down"></Icon>
                    </Link>              
                  </Col>
                </Row>
              </ListItem>
            )
          })}
        </List>
    </Block>
    <Fab position="center-bottom" slot="fixed" text={`اعتماد ${totalPrice}`} color="red" onClick={() => props.f7router.navigate('/confirmPurchase/')}>
      <Icon ios="f7:check" aurora="f7:check" md="material:done"></Icon>
    </Fab>

    <Toolbar bottom>
      <Link href='/home/'>
        <Icon ios="f7:home_fill" aurora="f7:home_fill" md="material:home"></Icon>
      </Link>
      <Link href='#' onClick={() => dispatch({type: 'CLEAR_BASKET'})}>
        <Icon ios="f7:trash_fill" aurora="f7:trash_fill" md="material:delete"></Icon>
      </Link>
    </Toolbar>
  </Page>
  )
}
export default Basket
