import React, { useContext, useEffect, useState } from 'react'
import { Block, Fab, Page, Navbar, List, ListItem, Toolbar, Link, Icon, Stepper } from 'framework7-react'
import { StoreContext } from '../data/store'
import { quantityText } from '../data/actions'
import labels from '../data/labels'
import PackImage from './pack-image'

const Basket = props => {
  const { state, dispatch } = useContext(StoreContext)
  const [store] = useState(() => state.stores.find(s => s.id === state.basket.storeId))
  const [basket, setBasket] = useState([])
  const [totalPrice, setTotalPrice] = useState('')
  useEffect(() => {
    if (!state.basket.packs) props.f7router.navigate('/home/', {reloadAll: true})
  }, [state.basket, props.f7router])
  useEffect(() => {
    setBasket(() => {
      const basket = state.basket?.packs || []
      return basket.map(p => {
        const packInfo = state.packs.find(pa => pa.id === p.packId)
        return {
          ...p,
          packInfo,
        }
      })
    })
    setTotalPrice(() => state.basket.packs?.reduce((sum, p) => sum + Math.trunc(p.cost * (p.weight || p.quantity)), 0) || 0)
  }, [state.basket, state.packs])
  const handleAdd = pack => {
    if (store.id === 's') {
      const stock = state.packPrices.find(p => p.packId === pack.packId && p.storeId === 's')
      if (pack.quantity === pack.requested) return
      if (pack.quantity === stock.quantity) return
    }
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
              title={p.packInfo.productName}
              subtitle={p.packInfo.productAlias}
              text={p.packInfo.name}
              footer={`${labels.grossPrice}: ${(Math.trunc(p.cost * (p.weight || p.quantity)) / 1000).toFixed(3)}`}
              key={i++}
            >
              <PackImage slot="media" pack={p.packInfo} type="list" />
              <div className="list-subtext1">{`${labels.unitPrice}: ${(p.cost / 1000).toFixed(3)}`}</div>
              <div className="list-subtext2">{`${labels.quantity}: ${quantityText(p.quantity, p.weight)}`}</div>
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
