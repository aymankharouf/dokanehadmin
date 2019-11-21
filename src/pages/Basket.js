import React, { useContext, useMemo } from 'react'
import { Block, Fab, Page, Navbar, List, ListItem, Toolbar, Link, Icon, Stepper, Badge } from 'framework7-react'
import { StoreContext } from '../data/Store';

const Basket = props => {
  const { state, dispatch } = useContext(StoreContext)
  const store = useMemo(() => state.stores.find(s => s.id === state.basket.storeId)
  , [state.basket, state.stores])
  const totalPrice = useMemo(() => state.basket.packs.reduce((sum, p) => sum + (p.purchasePrice * p.quantity), 0)
  , [state.basket])
  const handleAdd = pack => {
    if (store.id === 's') {
      const packInfo = state.packs.find(p => p.id === pack.packId)
      const quantityInStock = packInfo.stores.find(s => s.storeId === 's').quantity
      if (pack.quantity === pack.requestedQuantity) return
      if (pack.quantity === quantityInStock) return
    }
    dispatch({type: 'ADD_QUANTITY', pack})
  }
  const handleDelete = () => {
    props.f7router.navigate('/home/', {reloadAll: true})
    dispatch({type: 'CLEAR_BASKET'})
  }
  return (
    <Page>
      <Navbar title={`${state.labels.basket_from} ${store.name}`} backLink={state.labels.back} />
      <Block>
        <List mediaList>
          {state.basket.packs && state.basket.packs.map(p => {
            const packInfo = state.packs.find(pa => pa.id === p.packId)
            const productInfo = state.products.find(pr => pr.id === packInfo.productId)
            return (
              <ListItem
                title={productInfo.name}
                footer={((p.purchasePrice * p.quantity) / 1000).toFixed(3)}
                subtitle={packInfo.name}
                key={p.packId}
              >
                <img slot="media" src={productInfo.imageUrl} className="img-list" alt={productInfo.name} />
                <Stepper
                  slot="after"
                  fill
                  buttonsOnly
                  onStepperPlusClick={() => handleAdd(p)}
                  onStepperMinusClick={() => dispatch({type: 'REMOVE_QUANTITY', pack: p})}
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
        <Link href='#' iconMaterial="delete" onClick={() => handleDelete()} />
      </Toolbar>
    </Page>
  )
}
export default Basket
