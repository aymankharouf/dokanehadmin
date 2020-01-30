import React, { useContext, useState, useEffect, useRef } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon, Actions, ActionsButton } from 'framework7-react'
import { StoreContext } from '../data/store'
import { updateOrderStatus, showMessage, showError, getMessage, quantityDetails, sendOrder, finishOrder, mergeOrder } from '../data/actions'
import labels from '../data/labels'
import { orderPackStatus } from '../data/config'
import BottomToolbar from './bottom-toolbar'

const OrderDetails = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [order] = useState(() => props.type === 'a' ? state.archivedOrders.find(o => o.id === props.id) : state.orders.find(o => o.id === props.id))
  const [orderBasket, setOrderBasket] = useState([])
  const [statusActions, setStatusActions] = useState([])
  const [lastOrder, setLastOrder] = useState('')
  const actionsList = useRef('')
  useEffect(() => {
    setOrderBasket(() => order.basket.map(p => {
      const storeName = p.storeId ? (p.storeId === 'm' ? labels.multipleStores : state.stores.find(s => s.id === p.storeId).name) : ''
      const changePriceNote = p.actual && p.actual !== p.price ? `${labels.orderPrice}: ${(p.price / 1000).toFixed(3)}, ${labels.currentPrice}: ${(p.actual / 1000).toFixed(3)}` : ''
      const statusNote = `${orderPackStatus.find(s => s.id === p.status).name} ${p.overPriced ? labels.overPricedNote : ''}`
      return {
        ...p,
        storeName,
        changePriceNote,
        statusNote
      }
    }))
  }, [order, state.stores])
  useEffect(() => {
    setStatusActions(() => {
      const statusActions = [
        {id: 'a', name: 'اعتماد', status: ['n', 's']},
        {id: 'e', name: 'تعديل', status: ['n', 'a', 'e', 's', 'd', 'p']},
        {id: 's', name: 'تعليق', status: ['n', 'a']},
        {id: 'r', name: 'رفض', status: ['n', 's']},
        {id: 'c', name: 'الغاء', status: ['n', 's', 'a']},
        {id: 'i', name: 'استيداع', status: ['d', 'e', 'p']},
      ]
      return statusActions.filter(a => a.status.find(s => s === order.status))
    })
  }, [order])
  useEffect(() => {
    setLastOrder(() => {
      const userOrders = state.orders.filter(o => o.id !== order.id && o.userId === order.userId)
      userOrders.sort((o1, o2) => o2.activeTime.seconds - o1.activeTime.seconds)
      return ['a', 'e'].includes(userOrders[0]?.status) ? userOrders[0] : ''
    })
  }, [state.orders, order])
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

  const handleAction = async type => {
    try{
      if (type === 'e') {
        props.f7router.navigate(`/edit-order/${order.id}`)
      } else if (type === 'a' && !state.customers.find(c => c.id === order.userId)){
        throw new Error('notApprovedUser')
      } else if (type === 'a' && lastOrder) {
        f7.dialog.confirm(labels.confirmMergeText, labels.confirmationTitle, async () => {
          try{
            if (order.withDelivery !== lastOrder.withDelivery) {
              throw new Error('diffInDelivery')
            }
            if (order.urgent !== lastOrder.urgent) {
              throw new Error('diffInUrgent')
            }
            let found
            for (let p of order.basket) {
              found = lastOrder.basket.find(bp => bp.packId === p.packId)
              if (found && found.price !== p.price) {
                throw new Error('samePackWithDiffPrice')
              }
              if (found && found.weight > 0 && state.packs.find(pa => pa.id === p.packId).isDivided) {
                throw new Error('samePackPurchasedByWeight')
              }
            }
            setInprocess(true)
            await mergeOrder(lastOrder, order.basket, order.id)
            setInprocess(false)
            showMessage(labels.mergeSuccess)
            props.f7router.back()
          } catch(err) {
            setInprocess(false)
            setError(getMessage(props, err))
          }
        }, async () => {
          try{
            setInprocess(true)
            await updateOrderStatus(order, type, state.storePacks, state.packs, state.users, false)
            setInprocess(false)
            showMessage(labels.editSuccess)
            props.f7router.back()
              } catch(err) {
            setInprocess(false)
            setError(getMessage(props, err))
          }
        })
      } else if (type === 'i') {
        f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, async () => {
          try{
            setInprocess(true)
            await updateOrderStatus(order, type, state.storePacks, state.packs, state.users, true)
            setInprocess(false)
            showMessage(labels.editSuccess)
            props.f7router.back()
          } catch(err) {
            setInprocess(false)
            setError(getMessage(props, err))
          }
        }, async () => {
          try{
            setInprocess(true)
            await updateOrderStatus(order, type, state.storePacks, state.packs, state.users, false)
            setInprocess(false)
            showMessage(labels.editSuccess)
            props.f7router.back()
          } catch(err) {
            setInprocess(false)
            setError(getMessage(props, err))
          }
        })
      } else {
        setInprocess(true)
        await updateOrderStatus(order, type, state.storePacks, state.packs, state.users, false)
        setInprocess(false)
        showMessage(labels.editSuccess)
        props.f7router.back()
      }
    } catch(err) {
      setInprocess(false)
			setError(getMessage(props, err))
		}
  }
  const handleSend = async () => {
    try{
      setInprocess(true)
      await sendOrder(order, order.position === 's' ? (order.withDelivery ? 'd' : 'c') : 's')
      setInprocess(false)
      showMessage(labels.sendSuccess)
      props.f7router.back()
    } catch(err) {
      setInprocess(false)
      setError(getMessage(props, err))
    }
  }
  const handleDelivery = async () => {
    try{
      if (order.status === 't') {
        f7.dialog.confirm(labels.confirmeReceiveText, labels.confirmationTitle, async () => {
          try{
            setInprocess(true)
            await finishOrder(order, 'f', state.storePacks, state.packs, state.users, false)
            setInprocess(false)
            showMessage(labels.editSuccess)
            props.f7router.back()  
          } catch(err) {
            setInprocess(false)
            setError(getMessage(props, err))
          }
        })  
      } else {
        setInprocess(true)
        await finishOrder(order, 'f', state.storePacks, state.packs, state.users, false)
        setInprocess(false)
        showMessage(labels.editSuccess)
        props.f7router.back()  
      }
    } catch(err) {
      setInprocess(false)
			setError(getMessage(props, err))
		}
  }
  const handleReturn = async () => {
    try {
      setInprocess(true)
      await updateOrderStatus(order, 'i', state.storePacks, state.packs, state.users, false)
      setInprocess(false)
      showMessage(labels.editSuccess)
      props.f7router.back()
    } catch(err) {
      setInprocess(false)
			setError(getMessage(props, err))
		}
  }
  return(
    <Page>
      <Navbar title={labels.orderDetails} backLink={labels.back} />
      <Block>
        <List mediaList>
          {orderBasket.map(p => 
            <ListItem 
              key={p.packId} 
              title={p.productName}
              subtitle={p.packName}
              text={p.storeName ? `${labels.storeName}: ${p.storeName}` : ''}
              footer={quantityDetails(p)}
              after={(p.gross / 1000).toFixed(3)}
            >
              {p.changePriceNote ? <div className="list-subtext1">{p.changePriceNote}</div> : ''}
              <div className="list-subtext2">{`${labels.status}: ${p.statusNote}`}</div>
            </ListItem>
          )}
          <ListItem 
            title={labels.total} 
            className="total"
            after={(order.total / 1000).toFixed(3)} 
          />
          <ListItem 
            title={labels.fixedFees} 
            className="fees" 
            after={(order.fixedFees / 1000).toFixed(3)} 
          />
          {order.deliveryFees > 0 ? 
            <ListItem 
              title={labels.deliveryFees} 
              className="fees" 
              after={(order.deliveryFees / 1000).toFixed(3)} 
            /> 
          : ''}
          {order.discount > 0 ? 
            <ListItem 
              title={labels.discount} 
              className="discount" 
              after={(order.discount / 1000).toFixed(3)} 
            /> 
          : ''}
          <ListItem 
            title={labels.net} 
            className="net" 
            after={((order.total + order.fixedFees + (order.deliveryFees || 0) - (order.discount || 0)) / 1000).toFixed(3)} 
          />
          {order.profit ? 
            <ListItem 
              title={labels.profit} 
              after={(order.profit / 1000).toFixed(3)} 
            /> 
          : ''}
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => actionsList.current.open()}>
        <Icon material="build"></Icon>
      </Fab>
      {props.type === 'f' ?
        <Actions ref={actionsList}>
          <ActionsButton onClick={() => props.f7router.navigate(`/customer-details/${order.userId}`)}>{labels.customerInfo}</ActionsButton>
          {order.position === 's' ? 
            <ActionsButton onClick={() => props.f7router.navigate(`/return-order/${props.id}`)}>{labels.returnPacks}</ActionsButton>
          : ''}
          {order.status === 'p' ? 
            <ActionsButton onClick={() => props.f7router.navigate(`/customer-calls/${props.id}`)}>{labels.customerCalls}</ActionsButton>
          : ''}
          {order.status === 'p' && order.total > 0 ?
            <ActionsButton onClick={() => handleSend()}>
              {order.position === 's' ? (order.withDelivery ? labels.toCar : labels.toCenter) : labels.toStore}
            </ActionsButton>
          : ''}
          {order.status === 't' || (order.status === 'p' && order.position === 's') ?
            <ActionsButton onClick={() => handleDelivery()}>{order.status === 't' ? labels.receiveOrderAmount : labels.deliver}</ActionsButton>
          : ''}
          {order.total === 0 ? 
            <ActionsButton onClick={() => handleReturn()}>{labels.toStock}</ActionsButton>
          : ''}
        </Actions>
      : 
        <Actions ref={actionsList}>
          <ActionsButton onClick={() => props.f7router.navigate(`/customer-details/${order.userId}`)}>{labels.customerInfo}</ActionsButton>
          {props.type === 'n' && statusActions.map(a => 
            <ActionsButton key={a.id} onClick={() => handleAction(a.id)}>{a.name}</ActionsButton>
          )}
        </Actions>
      }
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}
export default OrderDetails
