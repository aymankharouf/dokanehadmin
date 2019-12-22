import React, { useContext, useState, useMemo, useEffect } from 'react'
import { Page, Navbar, Card, CardContent, CardFooter, Toolbar, Fab, Icon, FabButton, FabButtons } from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import { StoreContext } from '../data/Store'
import { showError, returnOrderPacks, showMessage, getMessage } from '../data/Actions'
import PackImage from './PackImage'

const ReturnOrderPack = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const pack = useMemo(() => state.packs.find(p => p.id === props.packId)
  , [state.packs, props.packId])
  const product = useMemo(() => state.products.find(p => p.id === pack.productId)
  , [state.products, pack])
  const orderPack = useMemo(() => {
    const basket = state.orders.find(o => o.id === props.orderId).basket
    return basket.find(p => p.packId === props.packId)
  }, [state.orders, props.orderId, props.packId])
  const [returned, setReturned] = useState(orderPack.returned || 0)
  useEffect(() => {
    if (error) {
      showError(props, error)
      setError('')
    }
  }, [error, props])
  const handleSumit = () => {
    props.f7router.app.dialog.confirm(state.labels.confirmationText, state.labels.confirmationTitle, async () => {
      try{
        const order = state.orders.find(o => o.id === props.orderId)
        await returnOrderPacks(order, pack, returned, state.customers)
        showMessage(props, state.labels.editSuccess)
        props.f7router.back()
      } catch(err) {
        setError(getMessage(props, err))
      }
    })
  }
  const handleDecrease = () => {
    if (orderPack.purchased > returned) {
      if (orderPack.weight) {
        setReturned(orderPack.weight)
      } else {
        setReturned(returned + 1)
      }
    }
  }
  const handleIncrease = () => {
    if (returned > 0) {
      if (orderPack.weight) {
        setReturned(orderPack.weight)
      } else {
        setReturned(returned - 1)
      }
    }
  }
  return (
    <Page>
      <Navbar title={`${product.name} ${pack.name}`} backLink={state.labels.back} />
      <Card>
        <CardContent>
          <PackImage pack={pack} type="card" />
        </CardContent>
        <CardFooter>
          <p>{(orderPack.actual / 1000).toFixed(3)}</p>
          <p>{(orderPack.weight ?? orderPack.purchased) - returned}</p>
        </CardFooter>
      </Card>
      <Fab position="left-top" slot="fixed" color="orange">
        <Icon material="keyboard_arrow_down"></Icon>
        <Icon material="close"></Icon>
        <FabButtons position="bottom">
          <FabButton color="green" onClick={() => handleIncrease()}>
            <Icon material="add"></Icon>
          </FabButton>
          <FabButton color="red" onClick={() => handleDecrease()}>
            <Icon material="remove"></Icon>
          </FabButton>
          {(orderPack.returned ?? 0) === returned ? '' :
            <FabButton color="blue" onClick={() => handleSumit()}>
              <Icon material="done"></Icon>
            </FabButton>
          }
        </FabButtons>
      </Fab>

      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default ReturnOrderPack
