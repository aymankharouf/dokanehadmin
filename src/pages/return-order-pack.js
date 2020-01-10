import React, { useContext, useState, useMemo, useEffect } from 'react'
import { f7, Page, Navbar, Card, CardContent, CardFooter, Toolbar, Fab, Icon, FabButton, FabButtons } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import { showError, returnOrderPacks, showMessage, getMessage } from '../data/actions'
import PackImage from './pack-image'
import labels from '../data/labels'

const ReturnOrderPack = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const pack = useMemo(() => state.packs.find(p => p.id === props.packId)
  , [state.packs, props.packId])
  const orderPack = useMemo(() => {
    const basket = state.orders.find(o => o.id === props.orderId).basket
    return basket.find(p => p.packId === props.packId)
  }, [state.orders, props.orderId, props.packId])
  const [returned, setReturned] = useState(orderPack.returned || 0)
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

  const handleSumit = () => {
    f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, async () => {
      try{
        const order = state.orders.find(o => o.id === props.orderId)
        setInprocess(true)
        await returnOrderPacks(order, pack, returned)
        setInprocess(false)
        showMessage(labels.editSuccess)
        props.f7router.back()
      } catch(err) {
        setInprocess(false)
        setError(getMessage(props, err))
      }
    })
  }
  const handleDecrease = () => {
    if (orderPack.weight) {
      setReturned(orderPack.weight)
    } else {
      setReturned(returned + 1)
    }
  }
  const handleIncrease = () => {
    if (orderPack.weight) {
      setReturned(0)
    } else {
      setReturned(returned - 1)
    }
  }
  return (
    <Page>
      <Navbar title={`${pack.productName} ${pack.name}`} backLink={labels.back} />
      <Card>
        <CardContent>
          <PackImage pack={pack} type="card" />
        </CardContent>
        <CardFooter>
          <p>{(orderPack.actual / 1000).toFixed(3)}</p>
          <p>{(orderPack.weight || orderPack.purchased) - returned}</p>
        </CardFooter>
      </Card>
      <Fab position="left-top" slot="fixed" color="orange" className="top-fab">
        <Icon material="keyboard_arrow_down"></Icon>
        <Icon material="close"></Icon>
        <FabButtons position="bottom">
          {returned > 0 ? 
            <FabButton color="green" onClick={() => handleIncrease()}>
              <Icon material="add"></Icon>
            </FabButton>
          : ''}
          {orderPack.purchased > returned ? 
            <FabButton color="red" onClick={() => handleDecrease()}>
              <Icon material="remove"></Icon>
            </FabButton>
          : ''}
          {(orderPack.returned || 0) === returned ? '' :
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
