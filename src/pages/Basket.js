import React, { useContext, useMemo, useEffect } from 'react'
import { Block, Fab, Page, Navbar, List, ListItem, Toolbar, Link, Icon, Stepper, Badge } from 'framework7-react'
import { StoreContext } from '../data/Store';
import { quantityText } from '../data/Actions'

const Basket = props => {
  const { state, dispatch } = useContext(StoreContext)
  const store = useMemo(() => state.stores.find(s => s.id === state.basket.storeId)
  , [state.basket, state.stores])
  const totalPrice = useMemo(() => state.basket.packs ? state.basket.packs.reduce((sum, p) => sum + (p.purchasePrice * (p.weight ? p.weight : p.quantity)), 0) : 0
  , [state.basket])
  let i = 0
  useEffect(() => {
    if (!state.basket) props.f7router.navigate('/home/', {reloadAll: true})
  }, [state.basket, props])
  const handleAdd = pack => {
    if (store.id === 's') {
      const stock = state.storePacks.find(p => p.packId === pack.packId && p.storeId === 's')
      if (pack.quantity === pack.requestedQuantity) return
      if (pack.quantity === stock.quantity) return
    }
    dispatch({type: 'INCREASE_QUANTITY', pack})
  }
  if (!state.basket) return null
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
                subtitle={packInfo.name}
                footer={`${state.labels.price}: ${((p.purchasePrice * (p.weight ? p.weight : p.quantity)) / 1000).toFixed(3)} (${(p.purchasePrice / 1000).toFixed(3)})`}
                key={i++}
              >
                <img slot="media" src={productInfo.imageUrl} className="img-list" alt={productInfo.name} />
                <Badge slot="title" color="green">{quantityText(p.quantity, state.labels, p.weight)}</Badge>
                <Stepper
                  slot="after"
                  fill
                  buttonsOnly
                  onStepperPlusClick={() => handleAdd(p)}
                  onStepperMinusClick={() => dispatch({type: 'DECREASE_QUANTITY', pack: p})}
                />
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
