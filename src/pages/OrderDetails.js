import React, { useContext, useMemo, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Popover, Link } from 'framework7-react'
import ReLogin from './ReLogin'
import { StoreContext } from '../data/store'
import { updateOrderStatus, showMessage, showError, getMessage, quantityDetails } from '../data/actions'
import labels from '../data/labels'

const OrderDetails = props => {
  const { state, user } = useContext(StoreContext)
  const [error, setError] = useState('')
  const order = useMemo(() => state.orders.find(o => o.id === props.id)
  , [state.orders, props.id])
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
      {id: 'a', title: 'اعتماد', status: ['n', 's'], cancelOrder: false},
      {id: 'e', title: 'تعديل', status: ['n', 'a', 'e', 's', 'f', 'p'], cancelOrder: false},
      {id: 's', title: 'تعليق', status: ['n', 'a'], cancelOrder: false},
      {id: 'r', title: 'رفض', status: ['n', 's'], cancelOrder: false},
      {id: 'c', title: 'الغاء', status: ['n', 's', 'a'], cancelOrder: true},
      {id: 'i', title: 'استيداع', status: ['f', 'e', 'p'], cancelOrder: true},
    ]
    return statusActions.filter(a => a.status.find(s => s === order.status) && (props.cancelOrderId ? a.cancelOrder : true))
  }, [order.status, props.cancelOrderId])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])

  const handleAction = async type => {
    try{
      if (type === 'e') {
        props.f7router.navigate(`/editOrder/${order.id}`)
      } else {
        if (type === 'a' && !state.customers.find(c => c.id === order.userId)){
          throw new Error('notApprovedUser')
        }
        await updateOrderStatus(order, type, state.storePacks, state.packs, state.customers, state.users, state.invitations, props.cancelOrderId)
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
          {order.basket.map(p => {
            const packInfo = state.packs.find(pa => pa.id === p.packId)
            const productInfo = state.products.find(pr => pr.id === packInfo.productId)
            const storeName = p.storeId ? (p.storeId === 'm' ? labels.multipleStores : state.stores.find(s => s.id === p.storeId).name) : ''
            const changePriceNote = p.actual && p.actual !== p.price ? `${labels.orderPrice}: ${(p.price / 1000).toFixed(3)}, ${labels.currentPrice}: ${(p.actual / 1000).toFixed(3)}` : ''
            const statusNote = `${state.orderPackStatus.find(s => s.id === p.status).name} ${p.overPriced ? labels.overPricedNote : ''}`
            return (
              <ListItem 
                key={p.packId} 
                title={productInfo.name}
                subtitle={packInfo.name}
                text={storeName ? `${labels.storeName}: ${storeName}` : ''}
                footer={quantityDetails(p)}
                after={(p.gross / 1000).toFixed(3)}
              >
                {changePriceNote ? <div className="list-subtext1">{changePriceNote}</div> : ''}
                <div className="list-subtext2">{`${labels.status}: ${statusNote}`}</div>
              </ListItem>
            )
          })}
          <ListItem 
            title={labels.total} 
            className="total"
            after={(order.total / 1000).toFixed(3)} 
          />
          <ListItem 
            title={labels.fixedFeesTitle} 
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
              title={labels.profitTitle} 
              after={(order.profit / 1000).toFixed(3)} 
            /> 
          : ''}
        </List>
      </Block>
      <Popover className="popover-menu">
        <List>
          <ListItem 
            link={`/customerDetails/${order.userId}/full/1`}
            popoverClose 
            title={labels.customerInfo} 
          />
          {statusActions.map(a => 
            <ListItem 
              link="#" 
              key={a.id} 
              popoverClose 
              title={a.title} 
              onClick={() => handleAction(a.id)}
            />
          )}
        </List>
      </Popover>
      <Toolbar bottom>
        <Link href="/home/" iconMaterial="home" />
        <Link popoverOpen=".popover-menu" iconMaterial="more_vert" />
      </Toolbar>
    </Page>
  )
}
export default OrderDetails
