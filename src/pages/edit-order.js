import React, { useContext, useEffect, useState } from 'react'
import { f7, Block, Fab, Page, Navbar, List, ListItem, Toolbar, Link, Icon, Stepper } from 'framework7-react'
import { StoreContext } from '../data/store'
import { updateOrderStatus, editOrder, showMessage, showError, getMessage, quantityDetails } from '../data/actions'
import PackImage from './pack-image'
import labels from '../data/labels'

const EditOrder = props => {
  const { state, dispatch } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [order] = useState(() => state.orders.find(o => o.id === props.id))
  const [orderBasket, setOrderBasket] = useState([])
  const [total, setTotal] = useState('')
  useEffect(() => {
    setOrderBasket(() => {
      let orderBasket = state.orderBasket?.filter(p => p.quantity > 0) || []
      orderBasket = orderBasket.map(p => {
        const packInfo = state.packs.find(pa => pa.id === p.packId) || ''
        return {
          ...p,
          packInfo
        }
      })
      return orderBasket
    })
  }, [state.orderBasket, state.packs])
  useEffect(() => {
    setTotal(() => orderBasket.reduce((sum, p) => sum + p.gross, 0))
  }, [orderBasket])
  useEffect(() => {
    dispatch({type: 'LOAD_ORDER_BASKET', order})
  }, [dispatch, order])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  useEffect(() => {
    if (inprocess) {
      f7.dialog.preloader(labels.inprocess)
    } else {
      f7.dialog.close()
    }
  }, [inprocess])

  const handleDelete = () => {
    f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, async () => {
      try{
        const type = ['f', 'p', 'e'].includes(order.status) ? 'i' : 'c'
        setInprocess(true)
        await updateOrderStatus(order, type, state.storePacks, state.packs)
        setInprocess(false)
        showMessage(labels.deleteSuccess)
        dispatch({type: 'CLEAR_ORDER_BASKET'})
        props.f7router.back()
      } catch(err) {
        setInprocess(false)
        setError(getMessage(props, err))
      }
    })  
  }
  const handleSubmit = async () => {
    try{
      setInprocess(true)
      await editOrder(order, state.orderBasket, state.storePacks, state.packs)
      setInprocess(false)
      showMessage(labels.editSuccess)
      dispatch({type: 'CLEAR_ORDER_BASKET'})
      props.f7router.back()
    } catch(err) {
      setInprocess(false)
			setError(getMessage(props, err))
		}
  }
  return (
    <Page>
      <Navbar title={labels.editOrder} backLink={labels.back} />
      <Block>
        <List mediaList>
          {orderBasket.map(p =>
            <ListItem
              title={p.productName}
              subtitle={p.productAlias}
              text={p.packName}
              footer={`${labels.grossPrice}: ${(p.gross / 1000).toFixed(3)}`}
              key={p.packId}
            >
              <PackImage slot="media" pack={p.packInfo} type="list" />
              <div className="list-subtext1">{`${labels.unitPrice}: ${(p.price / 1000).toFixed(3)}`}</div>
              <div className="list-subtext2">{quantityDetails(p)}</div>
              <Stepper
                slot="after"
                fill
                buttonsOnly
                onStepperPlusClick={() => dispatch({type: 'INCREASE_ORDER_QUANTITY', pack: p})}
                onStepperMinusClick={() => dispatch({type: 'DECREASE_ORDER_QUANTITY', pack: p})}
              />
            </ListItem>
          )}
        </List>
      </Block>
      <Fab position="center-bottom" slot="fixed" text={`${labels.submit} ${(total / 1000).toFixed(3)}`} color="green" onClick={() => handleSubmit()}>
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
