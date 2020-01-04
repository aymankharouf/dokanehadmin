import React, { useContext, useMemo, useState, useEffect } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon, Actions, ActionsButton } from 'framework7-react'
import ReLogin from './relogin'
import { StoreContext } from '../data/store'
import { updateOrderStatus, showMessage, showError, getMessage, quantityDetails } from '../data/actions'
import labels from '../data/labels'
import { orderPackStatus } from '../data/config'
import BottomToolbar from './bottom-toolbar'

const OrderDetails = props => {
  const { state, user } = useContext(StoreContext)
  const [error, setError] = useState('')
  const order = useMemo(() => state.orders.find(o => o.id === props.id)
  , [state.orders, props.id])
  const orderBasket = useMemo(() => order.basket.map(p => {
    const packInfo = state.packs.find(pa => pa.id === p.packId)
    const productInfo = state.products.find(pr => pr.id === packInfo.productId)
    const storeName = p.storeId ? (p.storeId === 'm' ? labels.multipleStores : state.stores.find(s => s.id === p.storeId).name) : ''
    const changePriceNote = p.actual && p.actual !== p.price ? `${labels.orderPrice}: ${(p.price / 1000).toFixed(3)}, ${labels.currentPrice}: ${(p.actual / 1000).toFixed(3)}` : ''
    const statusNote = `${orderPackStatus.find(s => s.id === p.status).name} ${p.overPriced ? labels.overPricedNote : ''}`
    return {
      ...p,
      packInfo,
      productInfo,
      storeName,
      changePriceNote,
      statusNote
    }
  }), [order, state.packs, state.products, state.stores])
  const fractionFromProfit = useMemo(() => {
    let fraction = 0
    if (order.fixedFees === 0) {
      const profit = order.basket.reduce((sum, p) => sum + ['p', 'f', 'pu'].includes(p.status) ? parseInt((p.actual - p.cost) * (p.weight || p.purchased)) : 0, 0)
      fraction = profit - order.profit
    }
    return fraction
  }, [order])
  const statusActions = useMemo(() => {
    const statusActions = [
      {id: 'a', title: 'اعتماد', status: ['n', 's'], cancelFlag: false},
      {id: 'e', title: 'تعديل', status: ['n', 'a', 'e', 's', 'f', 'p'], cancelFlag: false},
      {id: 's', title: 'تعليق', status: ['n', 'a'], cancelFlag: false},
      {id: 'r', title: 'رفض', status: ['n', 's'], cancelFlag: false},
      {id: 'c', title: 'الغاء', status: ['n', 's', 'a'], cancelFlag: true},
      {id: 'i', title: 'استيداع', status: ['f', 'e', 'p'], cancelFlag: true},
    ]
    return statusActions.filter(a => a.status.find(s => s === order.status) && (props.requestId ? a.cancelFlag : true))
  }, [order.status, props.requestId])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])

  const handleAction = async type => {
    try{
      if (type === 'e') {
        props.f7router.navigate(`/edit-order/${order.id}`)
      } else {  
        if (type === 'a' && !state.customers.find(c => c.id === order.userId)){
          throw new Error('notApprovedUser')
        }
        if (type === 'i') {
          f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, async () => {
            try{
              await updateOrderStatus(order, type, state.storePacks, state.packs, state.users, state.invitations, props.requestId, true)
              showMessage(labels.editSuccess)
              props.f7router.back()
            } catch(err) {
              setError(getMessage(props, err))
            }
          },
          async () => {
            try{
              await updateOrderStatus(order, type, state.storePacks, state.packs, state.users, state.invitations, props.requestId, false)
              showMessage(labels.editSuccess)
              props.f7router.back()
            } catch(err) {
              setError(getMessage(props, err))
            }
          })
        }
        await updateOrderStatus(order, type, state.storePacks, state.packs, state.users, state.invitations, props.requestId)
        showMessage(labels.editSuccess)
        props.f7router.back()
      }  
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  if (!user) return <ReLogin />
  return(
    <Page>
      <Navbar title={labels.orderDetails} backLink={labels.back} />
      <Block>
        <List mediaList>
          {orderBasket.map(p => 
            <ListItem 
              key={p.packId} 
              title={p.productInfo.name}
              subtitle={p.packInfo.name}
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
            after={((order.total + order.fixedFees + (order.deliveryFees || 0) - (order.discount || 0) - fractionFromProfit) / 1000).toFixed(3)} 
          />
          {order.profit ? 
            <ListItem 
              title={labels.profit} 
              after={(order.profit / 1000).toFixed(3)} 
            /> 
          : ''}
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => f7.actions.open('#actions')}>
        <Icon material="build"></Icon>
      </Fab>
      <Actions id="actions">
        <ActionsButton onClick={() => props.f7router.navigate(`/customer-details/${order.userId}/full/1`)}>{labels.customerInfo}</ActionsButton>
        {statusActions.map(a => 
          <ActionsButton key={a.id} onClick={() => handleAction(a.id)}>{a.title}</ActionsButton>
        )}
      </Actions>

      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}
export default OrderDetails
