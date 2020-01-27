import React, { useContext, useEffect, useState } from 'react'
import { Block, Fab, Page, Navbar, List, ListItem, Toolbar, Link, Icon, Stepper } from 'framework7-react'
import { StoreContext } from '../data/store'
import { quantityText } from '../data/actions'
import labels from '../data/labels'

const Basket = props => {
  const { state, dispatch } = useContext(StoreContext)
  const [store] = useState(() => state.stores.find(s => s.id === state.basket.storeId))
  const [basket, setBasket] = useState([])
  const [totalPrice, setTotalPrice] = useState('')
  useEffect(() => {
    setBasket(() => {
      let basket = state.basket ? state.basket.packs : []
      basket = basket.map(p => {
        const packInfo = state.packs.find(pa => pa.id === p.packId) || ''
        const weightText = p.weight && p.weight !== p.quantity ? `(${quantityText(p.weight)})` : '' 
        return {
          ...p,
          packInfo,
          weightText
        }
      })
      return basket.sort((p1, p2) => p1.time - p2.time)
    })
    setTotalPrice(() => state.basket?.packs?.reduce((sum, p) => sum + parseInt(p.cost * (p.weight || p.quantity)), 0) || 0)
  }, [state.basket, state.packs])
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
      <Navbar title={`${labels.basket_from} ${store?.name}`} backLink={labels.back} />
      <Block>
        <List mediaList>
          {basket.map(p => 
            <ListItem
              title={p.packInfo.productName}
              subtitle={p.packInfo.name}
              text={`${labels.unitPrice}: ${(p.cost / 1000).toFixed(3)}`}
              footer={`${labels.grossPrice}: ${(parseInt(p.cost * (p.weight || p.quantity)) / 1000).toFixed(3)}`}
              key={i++}
            >
              <div className="list-subtext1">{`${labels.quantity}: ${quantityText(p.quantity)} ${p.weightText}`}</div>
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
