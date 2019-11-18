import React, { useContext, useEffect, useMemo } from 'react'
import { Block, Fab, Page, Navbar, List, ListItem, Toolbar, Link, Icon, Stepper, Badge } from 'framework7-react'
import { StoreContext } from '../data/Store';

const Basket = props => {
  const { state, dispatch } = useContext(StoreContext)
  const store = useMemo(() => state.stores.find(s => s.id === state.basket.storeId)
  , [state.basket, state.stores])
  const totalPrice = useMemo(() => state.basket.packs.reduce((sum, p) => sum + (p.purchasePrice * p.quantity), 0)
  , [state.basket])
  const handleAdd = pack => {
    const storeQuantity = pack.stores.find(s => s.id === store.id).quantity
    if (!storeQuantity || pack.quantity < Math.min(storeQuantity, pack.requestedQuantity)) {
      dispatch({type: 'ADD_QUANTITY', pack})
    }
  }
  useEffect(() => {
    if (!state.basket.packs) {
      props.f7router.navigate('/home/', {reloadAll: true})
    }
  }, [state.basket, props])
  return (
    <Page>
      <Navbar title={`${state.labels.basket_from} ${store.name}`} backLink={state.labels.back} />
      <Block>
        <List mediaList>
          {state.basket.packs && state.basket.packs.map(p => {
            const productInfo = state.products.find(pr => pr.id === p.productId)
            return (
              <ListItem
                title={productInfo.name}
                footer={((p.purchasePrice * p.quantity) / 1000).toFixed(3)}
                subtitle={p.name}
                key={p.id}
              >
                <img slot="media" src={productInfo.imageUrl} width="80" alt={productInfo.name} />
                <Stepper
                  slot="after"
                  fill
                  buttonsOnly
                  onStepperPlusClick={() => handleAdd(p)}
                  onStepperMinusClick={() => dispatch({type: 'REMOVE_QUANTITY', p})}
                />
                {p.quantity > 1 ? <Badge slot="title" color="red">{p.quantity}</Badge> : ''}
              </ListItem>
            )
          })}
        </List>
      </Block>
      <Fab position="center-bottom" slot="fixed" text={`${state.labels.submit} ${(totalPrice / 1000).toFixed(3)}`} color="green" onClick={() => props.f7router.navigate('/confirmPurchase/')}>
        <Icon material="done"></Icon>
      </Fab>

      <Toolbar bottom>
        <Link href='/home/' iconMaterial="home" />
        <Link href='#' iconMaterial="delete" onClick={() => dispatch({type: 'CLEAR_BASKET'})} />
      </Toolbar>
    </Page>
  )
}
export default Basket
