import React, { useContext, useMemo, useEffect } from 'react'
import { Block, Fab, Page, Navbar, List, ListItem, Toolbar, Link, Icon, Stepper } from 'framework7-react'
import { StoreContext } from '../data/Store';
import { quantityText } from '../data/Actions'
import PackImage from './PackImage'

const Basket = props => {
  const { state, dispatch } = useContext(StoreContext)
  const store = useMemo(() => state.stores.find(s => s.id === state.basket.storeId)
  , [state.basket, state.stores])
  const basket = useMemo(() => state.basket ? [...state.basket.packs].sort((p1, p2) => p1.time - p2.time) : []
  , [state.basket])
  const totalPrice = useMemo(() => state.basket ? state.basket.packs.reduce((sum, p) => sum + parseInt(p.cost * (p.weight || p.quantity)), 0) : 0
  , [state.basket])
  let i = 0
  useEffect(() => {
    if (!state.basket) props.f7router.navigate('/home/', {reloadAll: true})
  }, [state.basket, props])
  const handleAdd = pack => {
    if (store.id === 's') {
      const stock = state.storePacks.find(p => p.packId === pack.packId && p.storeId === 's')
      if (pack.quantity === pack.requested) return
      if (pack.quantity === stock.quantity) return
    }
    dispatch({type: 'INCREASE_QUANTITY', pack})
  }
  
  return (
    <Page>
      <Navbar title={`${state.labels.basket_from} ${store?.name}`} backLink={state.labels.back} />
      <Block>
        <List mediaList>
          {basket.map(p => {
            const packInfo = state.packs.find(pa => pa.id === p.packId)
            const weightText = p.weight && p.weight !== p.quantity ? `(${quantityText(p.weight)})` : '' 
            return (
              <ListItem
                title={state.products.find(pr => pr.id === packInfo.productId).name}
                subtitle={packInfo.name}
                text={`${state.labels.unitPrice}: ${(p.cost / 1000).toFixed(3)}`}
                footer={`${state.labels.grossPrice}: ${(parseInt(p.cost * (p.weight || p.quantity)) / 1000).toFixed(3)}`}
                key={i++}
              >
                <PackImage slot="media" pack={packInfo} type="list" />
                <div className="list-subtext1">{`${state.labels.quantity}: ${quantityText(p.quantity)} ${weightText}`}</div>
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
      <Fab position="center-bottom" slot="fixed" text={`${state.labels.submit} ${(totalPrice / 1000).toFixed(3)}`} color="green" href="/confirmPurchase/">
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
