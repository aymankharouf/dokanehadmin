import React, { useContext, useEffect, useState } from 'react'
import { Block, Fab, Page, Navbar, List, ListItem, Toolbar, Link, Icon, Stepper, Badge } from 'framework7-react'
import { StoreContext } from '../data/store'
import { quantityText } from '../data/actions'
import labels from '../data/labels'

const Basket = props => {
  const { state, dispatch } = useContext(StoreContext)
  const [store] = useState(() => state.stores.find(s => s.id === state.basket.storeId))
  const [basket, setBasket] = useState([])
  const [totalPrice, setTotalPrice] = useState('')
  useEffect(() => {
    if (!state.basket.packs) props.f7router.navigate('/home/', {reloadAll: true})
  }, [state.basket, props.f7router])
  useEffect(() => {
    setBasket(() => state.basket?.packs || [])
    setTotalPrice(() => state.basket.packs?.reduce((sum, p) => sum + Math.trunc(p.cost * (p.weight || p.quantity)), 0) || 0)
  }, [state.basket])
  const handleAdd = pack => {
    if (store.id === 's') {
      const stock = state.packPrices.find(p => p.packId === pack.packId && p.storeId === 's')
      if (pack.quantity === pack.requested) return
      if (pack.quantity === stock.quantity) return
    }
    if (pack.isDivided) return
    if (pack.orderId && pack.quantity === pack.requested) return
    dispatch({type: 'INCREASE_QUANTITY', pack})
  }
  let i = 0  
  return (
    <Page>
      <Navbar title={`${labels.basketFrom} ${store?.name}`} backLink={labels.back} />
      <Block>
        <List mediaList>
          {basket.map(p => 
            <ListItem
              title={p.productName}
              subtitle={p.productAlias}
              text={p.packName}
              footer={`${labels.grossPrice}: ${(Math.trunc(p.cost * (p.weight || p.quantity)) / 1000).toFixed(3)}`}
              key={i++}
            >
              <img src={p.imageUrl} slot="media" className="img-list" alt={labels.noImage} />
              <div className="list-subtext1">{`${labels.unitPrice}: ${(p.cost / 1000).toFixed(3)}`}</div>
              <div className="list-subtext2">{`${labels.quantity}: ${quantityText(p.quantity, p.weight)}`}</div>
              {p.closeExpired ? <Badge slot="text" color="red">{labels.closeExpired}</Badge> : ''}
              <Stepper
                slot="after"
                fill
                buttonsOnly
                onStepperPlusClick={() => handleAdd(p)}
                onStepperMinusClick={() => dispatch({type: 'DECREASE_QUANTITY', pack: p})}
              />
            </ListItem>
          )}
        </List>
      </Block>
      <Fab position="center-bottom" slot="fixed" text={`${labels.submit} ${(totalPrice / 1000).toFixed(3)}`} color="green" href="/confirm-purchase/">
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
