import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon } from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store'
import { addMonthlyTrans, showMessage } from '../data/Actions'

const MonthlyTrans = props => {
  const { state } = useContext(StoreContext)
  const month = (Number(props.id) % 100) - 1
  const year = parseInt(Number(props.id) / 100)
  const monthlyTrans = useMemo(() => state.monthlyTrans.find(rec => rec.id === props.id)
  , [state.monthlyTrans, props.id])
  const orders = useMemo(() => {
    const orders = state.orders.filter(rec => ['a', 'e', 'f', 'd'].includes(rec.status) && (rec.statusTime.toDate()).getFullYear() === year && (rec.time.toDate()).getMonth() === month)
    return orders
  }, [state.orders, month, year])
  const finishedOrders = useMemo(() => {
    const finishedOrders = orders.filter(rec => rec.status === 'f')
    return finishedOrders
  }, [orders])
  const deliveredOrders = useMemo(() => {
    const deliveredOrders = orders.filter(rec => rec.status === 'd'
    )
    return deliveredOrders
  }, [orders])
  const ordersCount = monthlyTrans ? monthlyTrans.ordersCount : orders.length
  const deliveredOrdersCount = monthlyTrans ? monthlyTrans.deliveredOrdersCount : deliveredOrders.length
  const finishedOrdersCount = monthlyTrans ? monthlyTrans.finishedOrdersCount : finishedOrders.length
  const storePacks = useMemo(() => {
    if (monthlyTrans) return monthlyTrans.storePacks
    let storePacks = state.packs.map(pack => {
      return pack.stores.find(store => store.id === 's' && store.quantity > 0)
    })
    storePacks = storePacks.filter(rec => rec)
    const storeValue = storePacks.reduce((a, pack) => a + (pack.purchasePrice * pack.quantity), 0)
    return storeValue
  }, [state.packs, monthlyTrans])
  const sales = useMemo(() => monthlyTrans ? monthlyTrans.sales : deliveredOrders.reduce((a, order) => a + order.total, 0)
  , [deliveredOrders, monthlyTrans])
  const profit = useMemo(() => monthlyTrans ? monthlyTrans.profit : deliveredOrders.reduce((a, order) => a + order.profit, 0)
  , [deliveredOrders, monthlyTrans])
  const fixedFees = monthlyTrans ? monthlyTrans.fixedFees : deliveredOrdersCount * state.labels.fixedFeesValue
  const deliveryFees = useMemo(() => monthlyTrans ? monthlyTrans.deliveryFees : deliveredOrders.reduce((a, order) => a + order.deliveryFees, 0)
  , [deliveredOrders, monthlyTrans])
  const specialDiscounts = useMemo(() => monthlyTrans ? monthlyTrans.specialDiscounts : deliveredOrders.reduce((a, order) => a + (order.discount && order.discount.type === 's' ? order.discount.value : 0) , 0)
  , [deliveredOrders, monthlyTrans])
  const firstOrderDiscounts = useMemo(() => monthlyTrans ? monthlyTrans.firstOrderDiscounts : deliveredOrders.reduce((a, order) => a + (order.discount && order.discount.type === 'f' ? order.discount.value : 0) , 0)
  , [deliveredOrders, monthlyTrans])
  const invitationsDiscounts = useMemo(() => monthlyTrans ? monthlyTrans.invitationsDiscounts : deliveredOrders.reduce((a, order) => a + (order.discount && order.discount.type === 'i' ? order.discount.value : 0) , 0)
  , [deliveredOrders, monthlyTrans])
  const priceAlarmsDiscounts = useMemo(() => monthlyTrans ? monthlyTrans.priceAlarmsDiscounts : deliveredOrders.reduce((a, order) => a + (order.discount && order.discount.type === 'p' ? order.discount.value : 0) , 0)
  , [deliveredOrders, monthlyTrans])
  const spendings = useMemo(() => {
    return state.spendings.filter(rec => (rec.spendingDate.toDate()).getFullYear() === year && (rec.spendingDate.toDate()).getMonth() === month)
  }, [state.spendings, month, year])
  const withdrawals = useMemo(() => {
    if (monthlyTrans) return monthlyTrans.withdrawals
    const withdrawals = spendings.filter(rec => rec.type === 'w')
    return withdrawals.reduce((a, spending) => a + spending.spendingAmount, 0)
  }, [spendings, monthlyTrans])
  const expenses = useMemo(() => {
    if (monthlyTrans) return monthlyTrans.expenses
    const expenses = spendings.filter(rec => rec.type !== 'w')
    return expenses.reduce((a, spending) => a + spending.spendingAmount, 0)
  }, [spendings, monthlyTrans])
  const buttonVisisble = useMemo(() => {
    const today = new Date()
    if ((today.getFullYear() * 100 + Number(today.getMonth())) > year * 100 + month) {
      return monthlyTrans ? false : true
    }
    return false
  }, [year, month, monthlyTrans])
  const handleMonthlyTrans = () => {
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
    addMonthlyTrans(trans).then(() => {
      showMessage(props, 'success', state.labels.addSuccess)
      props.f7router.back()
    })
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
            title={state.labels.specialDiscounts}
            after={(specialDiscounts / 1000).toFixed(3)}
          />
          <ListItem
            link="#"
            title={state.labels.firstOrderDiscounts}
            after={(firstOrderDiscounts / 1000).toFixed(3)}
          />
          <ListItem
            link="#"
            title={state.labels.invitationsDiscounts}
            after={(invitationsDiscounts / 1000).toFixed(3)}
          />
          <ListItem
            link="#"
            title={state.labels.priceAlarmsDiscounts}
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
