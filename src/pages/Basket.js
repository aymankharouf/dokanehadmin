import React, { useContext, useEffect } from 'react'
import { Block, Fab, Page, Navbar, List, ListItem, Toolbar, Link, Icon, Stepper, Badge } from 'framework7-react'
import { StoreContext } from '../data/Store';

const Basket = props => {
  const { state, dispatch } = useContext(StoreContext)
  const store = state.basket.storeId ? state.stores.find(rec => rec.id === state.basket.storeId) : null
  const totalPrice = state.basket.products ? (state.basket.products.reduce((a, product) => a + product.netPrice, 0)) : null
  const handleAdd = (product) => {
    const storeQuantity = product.stores.find(rec => rec.id === store.id).quantity
    if (!storeQuantity) {
      dispatch({ type: 'ADD_QUANTITY', product })
    }
  }
  useEffect(() => {
    if (!state.basket.storeId) {
      props.f7router.navigate('/home/')
    }
  }, [state.basket])
  return (
    <Page>
      <Navbar title={`${state.labels.basket_from} ${store ? store.name : ''}`} backLink="Back" />
      <Block>
        <List mediaList>
          {state.basket.products && state.basket.products.map(product => {
            return (
              <ListItem
                title={product.name}
                footer={(product.netPrice / 1000).toFixed(3)}
                subtitle={product.description}
                key={product.id}
              >
                <img slot="media" src={product.imageUrl} width="80" alt="" />
                {product.quantity > 1 ? <Badge slot="title" color="red">{product.quantity}</Badge> : null}
                <Stepper
                  slot="after"
                  buttonsOnly={true}
                  small
                  raised
                  onStepperPlusClick={() => handleAdd(product)}
                  onStepperMinusClick={() => dispatch({ type: 'REMOVE_QUANTITY', product })}
                />
              </ListItem>
            )
          })}
        </List>
      </Block>
      <Fab position="center-bottom" slot="fixed" text={`${state.labels.submit} ${(totalPrice / 1000).toFixed(3)}`} color="red" onClick={() => props.f7router.navigate('/confirmPurchase/')}>
        <Icon ios="f7:check" aurora="f7:check" md="material:done"></Icon>
      </Fab>

      <Toolbar bottom>
        <Link href='/home/'>
          <Icon ios="f7:home_fill" aurora="f7:home_fill" md="material:home"></Icon>
        </Link>
        <Link href='#' onClick={() => dispatch({ type: 'CLEAR_BASKET' })}>
          <Icon ios="f7:trash_fill" aurora="f7:trash_fill" md="material:delete"></Icon>
        </Link>
      </Toolbar>
    </Page>
  )
}
export default Basket
