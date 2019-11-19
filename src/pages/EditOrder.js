import React, { useContext, useMemo, useEffect } from 'react'
import { Block, Fab, Page, Navbar, List, ListItem, Toolbar, Link, Icon, Stepper, Badge } from 'framework7-react'
import { StoreContext } from '../data/Store';
import { updateOrderStatus, editOrder, showMessage } from '../data/Actions';

const EditOrder = props => {
  const { state, dispatch } = useContext(StoreContext)
  const order = useMemo(() => state.orders.find(o => o.id === props.id)
  , [state.orders, props.id])
  const total = useMemo(() => state.orderBasket ? state.orderBasket.reduce((sum, p) => sum + (p.price * p.quantity), 0) : 0
  , [state.orderBasket])
  const handleChangePack = (pack, value) => {
    if (pack.quantity === 0 && value === -1) return 
    dispatch({type: 'CHANGE_ORDER_PACK', params: {pack, value}})
  }
  const handleDelete = () => {
    props.f7router.app.dialog.confirm(state.labels.confirmationText, () => {
      const type = ['f', 'd', 'e'].includes(order.status) ? 'i' : 'c'
      updateOrderStatus(order, type, state.packs).then(() => {
        showMessage(props, 'success', state.labels.deleteSuccess)
        dispatch({type: 'CLEAR_ORDER_BASKET'})
        props.f7router.back()
      })
    })
  }
  const handleSubmit = () => {
    editOrder(order, state.orderBasket, state.packs).then(() => {
      showMessage(props, 'success', state.labels.editSuccess)
      dispatch({type: 'CLEAR_ORDER_BASKET'})
      props.f7router.back()
    })
  }
  useEffect(() => {
    dispatch({type: 'LOAD_ORDER_BASKET', order})
  }, [dispatch, order])
  return (
    <Page>
      <Navbar title={state.labels.editOrder} backLink={state.labels.back} />
      <Block>
        <List mediaList>
          {state.orderBasket && state.orderBasket.map(p => {
            const packInfo = state.packs.find(pa => pa.id === p.packId)
            const productInfo = state.products.find(pr => pr.id === packInfo.productId)
            return (
              <ListItem
                title={productInfo.name}
                footer={((p.price * p.quantity) / 1000).toFixed(3)}
                subtitle={packInfo.name}
                key={p.packId}
              >
                <img slot="media" src={productInfo.imageUrl} width="80" alt={productInfo.name} />
                <Stepper
                  slot="after"
                  fill
                  buttonsOnly
                  onStepperPlusClick={() => handleChangePack(p, 1)}
                  onStepperMinusClick={() => handleChangePack(p, -1)}
                />
                  <Badge slot="title" color={p.purchasedQuantity === p.quantity ? 'green' : 'red'}>{`${p.unavailableQuantity ? '(' + p.unavailableQuantity + ')' : ''} ${p.purchasedQuantity} - ${p.quantity}`}</Badge>
              </ListItem>
            )
          })}
        </List>
      </Block>
      <Fab position="center-bottom" slot="fixed" text={`${state.labels.submit} ${(total / 1000).toFixed(3)}`} color="green" onClick={() => handleSubmit()}>
        <Icon material="done"></Icon>
      </Fab>

      <Toolbar bottom>
        <Link href='/home/' iconMaterial="home" />
        <Link href='#' iconMaterial="delete" onClick={() => handleDelete()} />
      </Toolbar>
    </Page>
  )
}
export default EditOrder
