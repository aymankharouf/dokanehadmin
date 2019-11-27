import React, { useContext, useMemo, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon } from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store'
import { addMonthlyTrans, showMessage, showError, getMessage } from '../data/Actions'

const MonthlyTrans = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const month = (Number(props.id) % 100) - 1
  const year = parseInt(Number(props.id) / 100)
  const monthlyTrans = useMemo(() => state.monthlyTrans.find(t => t.id === props.id)
  , [state.monthlyTrans, props.id])
  const orders = useMemo(() => {
    const orders = state.orders.filter(o => ['a', 'e', 'f', 'd'].includes(o.status) && (o.statusTime.toDate()).getFullYear() === year && (o.time.toDate()).getMonth() === month)
    return orders
  }, [state.orders, month, year])
  const finishedOrders = useMemo(() => {
    const finishedOrders = orders.filter(o => o.status === 'f')
    return finishedOrders
  }, [orders])
  const deliveredOrders = useMemo(() => {
    const deliveredOrders = orders.filter(o => o.status === 'd'
    )
    return deliveredOrders
  }, [orders])
  const ordersCount = monthlyTrans ? monthlyTrans.ordersCount : orders.length
  const deliveredOrdersCount = monthlyTrans ? monthlyTrans.deliveredOrdersCount : deliveredOrders.length
  const finishedOrdersCount = monthlyTrans ? monthlyTrans.finishedOrdersCount : finishedOrders.length
  const storePacks = useMemo(() => {
    if (monthlyTrans) return monthlyTrans.storePacks
    const storePacks = state.storePacks.filter(p => p.storeId === 's' && p.quantity > 0)
    const storeValue = storePacks.reduce((sum, p) => sum + (p.purchasePrice * p.quantity), 0)
    return storeValue
  }, [state.storePacks, monthlyTrans])
  const sales = useMemo(() => monthlyTrans ? monthlyTrans.sales : deliveredOrders.reduce((sum, o) => sum + o.total, 0)
  , [deliveredOrders, monthlyTrans])
  const profit = useMemo(() => monthlyTrans ? monthlyTrans.profit : deliveredOrders.reduce((sum, o) => sum + o.profit, 0)
  , [deliveredOrders, monthlyTrans])
  const fixedFees = monthlyTrans ? monthlyTrans.fixedFees : deliveredOrdersCount * state.labels.fixedFeesValue
  const deliveryFees = useMemo(() => monthlyTrans ? monthlyTrans.deliveryFees : deliveredOrders.reduce((sum, o) => sum + o.deliveryFees, 0)
  , [deliveredOrders, monthlyTrans])
  const specialDiscounts = useMemo(() => monthlyTrans ? monthlyTrans.specialDiscounts : deliveredOrders.reduce((sum, o) => sum + (o.discount && o.discount.type === 's' ? o.discount.value : 0) , 0)
  , [deliveredOrders, monthlyTrans])
  const firstOrderDiscounts = useMemo(() => monthlyTrans ? monthlyTrans.firstOrderDiscounts : deliveredOrders.reduce((sum, o) => sum + (o.discount && o.discount.type === 'f' ? o.discount.value : 0) , 0)
  , [deliveredOrders, monthlyTrans])
  const invitationsDiscounts = useMemo(() => monthlyTrans ? monthlyTrans.invitationsDiscounts : deliveredOrders.reduce((sum, o) => sum + (o.discount && o.discount.type === 'i' ? o.discount.value : 0) , 0)
  , [deliveredOrders, monthlyTrans])
  const priceAlarmsDiscounts = useMemo(() => monthlyTrans ? monthlyTrans.priceAlarmsDiscounts : deliveredOrders.reduce((sum, o) => sum + (o.discount && o.discount.type === 'p' ? o.discount.value : 0) , 0)
  , [deliveredOrders, monthlyTrans])
  const spendings = useMemo(() => {
    return state.spendings.filter(s => (s.spendingDate.toDate()).getFullYear() === year && (s.spendingDate.toDate()).getMonth() === month)
  }, [state.spendings, month, year])
  const withdrawals = useMemo(() => {
    if (monthlyTrans) return monthlyTrans.withdrawals
    const withdrawals = spendings.filter(s => s.type === 'w')
    return withdrawals.reduce((sum, s) => sum + s.spendingAmount, 0)
  }, [spendings, monthlyTrans])
  const expenses = useMemo(() => {
    if (monthlyTrans) return monthlyTrans.expenses
    const expenses = spendings.filter(s => s.type !== 'w')
    return expenses.reduce((sum, s) => sum + s.spendingAmount, 0)
  }, [spendings, monthlyTrans])
  const buttonVisisble = useMemo(() => {
    const today = new Date()
    if ((today.getFullYear() * 100 + Number(today.getMonth())) > year * 100 + month) {
      return monthlyTrans ? false : true
    }
    return false
  }, [year, month, monthlyTrans])
  useEffect(() => {
    if (error) {
      showError(props, error)
      setError('')
    }
  }, [error, props])

  const handleMonthlyTrans = async () => {
    try{
      const trans = {
        id: props.id,
        ordersCount,
        finishedOrdersCount,
        deliveredOrdersCount,
        storePacks,
        sales,
        profit,
        fixedFees,
        deliveryFees,
        specialDiscounts,
        firstOrderDiscounts,
        invitationsDiscounts,
        priceAlarmsDiscounts,
        withdrawals,
        expenses
      }
      await addMonthlyTrans(trans)
      showMessage(props, state.labels.addSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(err, state.labels, props.f7route.route.component.name))
		}
  }
  return(
    <Page>
      <Navbar title={`${state.labels.monthlyTrans} - ${props.id}`} backLink={state.labels.back} />
      <Block>
        <List>
          <ListItem
            link="#"
            title={state.labels.ordersCount}
            after={ordersCount}
          />
          <ListItem
            link="#"
            title={state.labels.finishedOrdersCount}
            after={finishedOrdersCount}
          />
          <ListItem
            link="#"
            title={state.labels.deliveredOrdersCount}
            after={deliveredOrdersCount}
          />
          <ListItem
            link="#"
            title={state.labels.storePacks}
            after={(storePacks / 1000).toFixed(3)}
          />
          <ListItem
            link="#"
            title={state.labels.sales}
            after={(sales / 1000).toFixed(3)}
          />
          <ListItem
            link="#"
            title={state.labels.profit}
            after={(profit / 1000).toFixed(3)}
          />
          <ListItem
            link="#"
            title={state.labels.fixedFees}
            after={(fixedFees / 1000).toFixed(3)}
          />
          <ListItem
            link="#"
            title={state.labels.deliveryFees}
            after={(deliveryFees / 1000).toFixed(3)}
          />
          <ListItem
            link="#"
            title={state.labels.netProfit}
            after={((profit + fixedFees + deliveryFees) / 1000).toFixed(3)}
          />
          <ListItem
            link="#"
            title={state.labels.specialDiscount}
            after={(specialDiscounts / 1000).toFixed(3)}
          />
          <ListItem
            link="#"
            title={state.labels.firstOrderDiscount}
            after={(firstOrderDiscounts / 1000).toFixed(3)}
          />
          <ListItem
            link="#"
            title={state.labels.invitationsDiscount}
            after={(invitationsDiscounts / 1000).toFixed(3)}
          />
          <ListItem
            link="#"
            title={state.labels.priceAlarmsDiscount}
            after={(priceAlarmsDiscounts / 1000).toFixed(3)}
          />
          <ListItem
            link="#"
            title={state.labels.withdrawals}
            after={(withdrawals / 1000).toFixed(3)}
          />
          <ListItem
            link="#"
            title={state.labels.expenses}
            after={(expenses / 1000).toFixed(3)}
          />
        </List>
      </Block>
      {buttonVisisble ? 
        <Fab position="left-top" slot="fixed" color="green" onClick={() => handleMonthlyTrans()}>
          <Icon material="done"></Icon>
        </Fab>
        : ''
      }
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default MonthlyTrans
