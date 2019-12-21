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
    const orders = state.orders.filter(o => ['a', 'e', 'f', 'p', 'd'].includes(o.status) && (o.statusTime.toDate()).getFullYear() === year && (o.time.toDate()).getMonth() === month)
    return orders
  }, [state.orders, month, year])
  const finishedOrders = useMemo(() => orders.filter(o => o.status === 'f' || o.status === 'p')
  , [orders])
  const deliveredOrders = useMemo(() => orders.filter(o => o.status === 'd')
  , [orders])
  const ordersCount = monthlyTrans?.ordersCount ?? orders.length
  const deliveredOrdersCount = monthlyTrans?.deliveredOrdersCount ?? deliveredOrders.length
  const finishedOrdersCount = monthlyTrans?.finishedOrdersCount ?? finishedOrders.length
  const storePacks = useMemo(() => {
    if (monthlyTrans) return monthlyTrans.storePacks
    const storePacks = state.storePacks.filter(p => p.storeId === 's' && p.quantity > 0)
    const storeValue = storePacks.reduce((sum, p) => sum + parseInt(p.cost * p.quantity), 0)
    return storeValue
  }, [state.storePacks, monthlyTrans])
  const sales = useMemo(() => monthlyTrans?.sales ?? deliveredOrders.reduce((sum, o) => sum + o.total, 0)
  , [deliveredOrders, monthlyTrans])
  const profit = useMemo(() => monthlyTrans?.profit ?? deliveredOrders.reduce((sum, o) => sum + o.profit, 0)
  , [deliveredOrders, monthlyTrans])
  const fixedFees = monthlyTrans?.fixedFees ?? deliveredOrders.reduce((sum, o) => sum + o.fixedFees, 0)
  const deliveryFees = useMemo(() => monthlyTrans?.deliveryFees ?? deliveredOrders.reduce((sum, o) => sum + o.deliveryFees, 0)
  , [deliveredOrders, monthlyTrans])
  const discounts = useMemo(() => monthlyTrans?.discounts ?? deliveredOrders.reduce((sum, o) => sum + (o.discount ? o.discount.value : 0), 0)
  , [deliveredOrders, monthlyTrans])
  const purchaseDiscounts = useMemo(() => {
    const purchases = state.purchases.filter(p => (p.time.toDate()).getFullYear() === year && (p.time.toDate()).getMonth() === month)
    return monthlyTrans?.purchasesDiscounts ?? purchases.reduce((sum, p) => sum + p.discount, 0)
  }, [state.purchases, month, year, monthlyTrans])
  const spendings = useMemo(() => state.spendings.filter(s => (s.spendingDate.toDate()).getFullYear() === year && (s.spendingDate.toDate()).getMonth() === month)
  , [state.spendings, month, year])
  const stockTrans = useMemo(() => state.stockTrans.filter(t => (t.time.toDate()).getFullYear() === year && (t.time.toDate()).getMonth() === month)
  , [state.stockTrans, month, year])
  const donations = useMemo(() => monthlyTrans?.donations ?? stockTrans.reduce((sum, t) => sum + (t.type === 'g' ? t.total : 0), 0)
  , [stockTrans, monthlyTrans])
  const damages = useMemo(() => monthlyTrans?.damages ?? stockTrans.reduce((sum, t) => sum + (t.type === 'd' ? t.total : 0), 0)
  , [stockTrans, monthlyTrans])
  const withdraws = useMemo(() => monthlyTrans?.withdraws ?? stockTrans.reduce((sum, t) => sum + (t.type === 'w' ? t.total : 0), 0)
  , [stockTrans, monthlyTrans])
  const cashing = useMemo(() => monthlyTrans?.cashing ?? stockTrans.reduce((sum, t) => sum + (t.type === 'c' ? t.total - parseInt(t.basket[0].cost * t.basket[0].quantity): 0), 0)
  , [stockTrans, monthlyTrans])
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
        purchaseDiscounts,
        discounts,
        withdrawals,
        expenses,
        donations,
        damages,
        withdraws
      }
      await addMonthlyTrans(trans)
      showMessage(props, state.labels.addSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  return(
    <Page>
      <Navbar title={`${state.labels.monthlyTrans} ${props.id}`} backLink={state.labels.back} className="page-title" />
      <Block>
        <List>
          <ListItem
            link="#"
            title={state.labels.ordersCount}
            after={ordersCount}
            className="list-title"
          />
          <ListItem
            link="#"
            title={state.labels.finishedOrdersCount}
            after={finishedOrdersCount}
            className="list-title"
          />
          <ListItem
            link="#"
            title={state.labels.deliveredOrdersCount}
            after={deliveredOrdersCount}
            className="list-title"
          />
          <ListItem
            link="#"
            title={state.labels.storePacks}
            after={(storePacks / 1000).toFixed(3)}
            className="list-title"
          />
          <ListItem
            link="#"
            title={state.labels.sales}
            after={(sales / 1000).toFixed(3)}
            className="list-title"
          />
          <ListItem
            link="#"
            title={state.labels.profitTitle}
            after={(profit / 1000).toFixed(3)}
            className="list-title"
          />
          <ListItem
            link="#"
            title={state.labels.fixedFeesTitle}
            after={(fixedFees / 1000).toFixed(3)}
            className="list-title"
          />
          <ListItem
            link="#"
            title={state.labels.deliveryFees}
            after={(deliveryFees / 1000).toFixed(3)}
            className="list-title"
          />
          <ListItem
            link="#"
            title={state.labels.purchaseDiscounts}
            after={(purchaseDiscounts / 1000).toFixed(3)}
            className="list-title"
          />
          <ListItem
            link="#"
            title={state.labels.netProfit}
            after={((profit + fixedFees + deliveryFees + purchaseDiscounts) / 1000).toFixed(3)}
            className="list-title"
          />
          <ListItem
            link="#"
            title={state.labels.discounts}
            after={(discounts / 1000).toFixed(3)}
            className="list-title"
          />
          <ListItem
            link="#"
            title={state.labels.withdrawals}
            after={(withdrawals / 1000).toFixed(3)}
            className="list-title"
          />
          <ListItem
            link="#"
            title={state.labels.expenses}
            after={(expenses / 1000).toFixed(3)}
            className="list-title"
          />
          <ListItem
            link="#"
            title={state.labels.donations}
            after={(donations / 1000).toFixed(3)}
            className="list-title"
          />
          <ListItem
            link="#"
            title={state.labels.damages}
            after={(damages / 1000).toFixed(3)}
            className="list-title"
          />
          <ListItem
            link="#"
            title={state.labels.withdraws}
            after={(withdraws / 1000).toFixed(3)}
            className="list-title"
          />
          <ListItem
            link="#"
            title={state.labels.cashing}
            after={(cashing / 1000).toFixed(3)}
            className="list-title"
          />
        </List>
      </Block>
      {buttonVisisble ? 
        <Fab position="left-top" slot="fixed" color="green" onClick={() => handleMonthlyTrans()}>
          <Icon material="done"></Icon>
        </Fab>
      : ''}
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default MonthlyTrans
