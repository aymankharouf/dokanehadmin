import React, { useContext, useState, useEffect } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import { addMonthlyTrans, showMessage, showError, getMessage } from '../data/actions'
import labels from '../data/labels'

const MonthlyTrans = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [buttonVisisble, setButtonVisible] = useState(false)
  const month = (Number(props.id) % 100) - 1
  const year = Math.trunc(Number(props.id) / 100)
  const [monthlyTrans] = useState(() => state.monthlyTrans.find(t => t.id === props.id))
  const [orders] = useState(() => state.orders.filter(o => ['a', 'e', 'f', 'p', 'd'].includes(o.status) && (o.time.toDate()).getFullYear() === year && (o.time.toDate()).getMonth() === month))
  const [finishedOrders, setFinishedOrders] = useState([])
  const [deliveredOrders, setDeliveredOrders] = useState([])
  const [ordersCount, setOrdersCount] = useState('')
  const [deliveredOrdersCount, setDeliveredOrdersCount] = useState('')
  const [finishedOrdersCount, setFinishedOrdersCount] = useState('')
  const [storePacks, setStorePacks] = useState([])
  const [sales, setSales] = useState('')
  const [profit, setProfit] = useState('')
  const [fixedFees, setFixedFees] = useState('')
  const [deliveryFees, setDeliveryFees] = useState('')
  const [discounts, setDiscounts] = useState('')
  const [deliveryDiscounts, setDeliveryDiscount] = useState('')
  const [purchaseDiscounts, setPurchasedDiscounts] = useState('')
  const [spendings, setSpendings] = useState([])
  const [stockTrans, setStockTrans] = useState([])
  const [donations, setDonations] = useState('')
  const [damages, setDamages] = useState('')
  const [sellings, setSellings] = useState('')
  const [withdrawals, setWithdrawals] = useState('')
  const [expenses, setExpenses] = useState('')
  useEffect(() => {
    setFinishedOrders(() => orders.filter(o => ['f', 'p'].includes(o.status)))
    setDeliveredOrders(() => orders.filter(o => o.status === 'd'))
  }, [orders])
  useEffect(() => {
    setOrdersCount(() => monthlyTrans?.ordersCount ?? orders.length)
  }, [monthlyTrans, orders])
  useEffect(() => {
    setDeliveredOrdersCount(() => monthlyTrans?.deliveredOrdersCount ?? deliveredOrders.length)
  }, [monthlyTrans, deliveredOrders])
  useEffect(() => {
    setFinishedOrdersCount(() => monthlyTrans?.finishedOrdersCount ?? finishedOrders.length)
  }, [monthlyTrans, finishedOrders])
  useEffect(() => {
    setStorePacks(() => {
      if (monthlyTrans) return monthlyTrans.storePacks
      const storePacks = state.storePacks.filter(p => p.storeId === 's' && p.quantity > 0)
      const storeValue = storePacks.reduce((sum, p) => sum + Math.trunc(p.cost * p.quantity), 0)
      return storeValue
    })
  }, [state.storePacks, monthlyTrans])
  useEffect(() => {
    setSales(() => monthlyTrans?.sales ?? deliveredOrders.reduce((sum, o) => sum + o.total, 0))
    setProfit(() => () => monthlyTrans?.profit ?? deliveredOrders.reduce((sum, o) => sum + o.profit, 0))
    setFixedFees(() => monthlyTrans?.fixedFees ?? deliveredOrders.reduce((sum, o) => sum + o.fixedFees, 0))
    setDeliveryFees(() => monthlyTrans?.deliveryFees ?? deliveredOrders.reduce((sum, o) => sum + o.deliveryFees, 0))
    setDiscounts(() => monthlyTrans?.discounts ?? deliveredOrders.reduce((sum, o) => sum + o.discount, 0))
    setDeliveryDiscount(() => monthlyTrans?.deliveryDiscounts ?? deliveredOrders.reduce((sum, o) => sum + o.deliveryDiscount, 0))
  }, [deliveredOrders, monthlyTrans])
  useEffect(() => {
    setPurchasedDiscounts(() => {
      const purchases = state.purchases.filter(p => (p.time.toDate()).getFullYear() === year && (p.time.toDate()).getMonth() === month)
      return monthlyTrans?.purchasesDiscounts ?? purchases.reduce((sum, p) => sum + p.discount, 0)
    })
  }, [state.purchases, month, year, monthlyTrans])
  useEffect(() => {
    setSpendings(() => state.spendings.filter(s => (s.spendingDate.toDate()).getFullYear() === year && (s.spendingDate.toDate()).getMonth() === month))
  }, [state.spendings, month, year])
  useEffect(() => {
    setStockTrans(() => state.stockTrans.filter(t => (t.time.toDate()).getFullYear() === year && (t.time.toDate()).getMonth() === month))
  }, [state.stockTrans, month, year])
  useEffect(() => {
    setDonations(() => monthlyTrans?.donations ?? stockTrans.reduce((sum, t) => sum + (t.type === 'g' ? t.total : 0), 0))
    setDamages(() => monthlyTrans?.damages ?? stockTrans.reduce((sum, t) => sum + (t.type === 'd' ? t.total : 0), 0))
    setSellings(() => monthlyTrans?.sellings ?? stockTrans.reduce((sum, t) => sum + (t.type === 's' ? t.total - Math.trunc(t.basket[0].cost * t.basket[0].quantity): 0), 0))
  }, [stockTrans, monthlyTrans])
  useEffect(() => {
    setWithdrawals(() => {
      if (monthlyTrans) return monthlyTrans.withdrawals
      const withdrawals = spendings.filter(s => s.type === 'w')
      return withdrawals.reduce((sum, s) => sum + s.spendingAmount, 0)
    })
    setExpenses(() => {
      if (monthlyTrans) return monthlyTrans.expenses
      const expenses = spendings.filter(s => s.type !== 'w')
      return expenses.reduce((sum, s) => sum + s.spendingAmount, 0)
    })
  }, [spendings, monthlyTrans])
  useEffect(() => {
    const today = new Date()
    if ((today.getFullYear() * 100 + Number(today.getMonth())) > year * 100 + month) {
      setButtonVisible(monthlyTrans ? false : true)
    } else {
      setButtonVisible(false)
    }
  }, [year, month, monthlyTrans])
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
        sellings,
        deliveryDiscounts
      }
      setInprocess(true)
      await addMonthlyTrans(trans, state.orders, state.purchases, state.stockTrans)
      setInprocess(false)
      showMessage(labels.addSuccess)
      props.f7router.back()
    } catch(err) {
      setInprocess(false)
			setError(getMessage(props, err))
		}
  }
  return(
    <Page>
      <Navbar title={`${labels.monthlyTrans} ${props.id}`} backLink={labels.back} />
      <Block>
        <List>
          <ListItem
            link="#"
            title={labels.ordersCount}
            after={ordersCount}
          />
          <ListItem
            link="#"
            title={labels.finishedOrdersCount}
            after={finishedOrdersCount}
          />
          <ListItem
            link="#"
            title={labels.deliveredOrdersCount}
            after={deliveredOrdersCount}
          />
          <ListItem
            link="#"
            title={labels.storePacks}
            after={(storePacks / 1000).toFixed(3)}
          />
          <ListItem
            link="#"
            title={labels.sales}
            after={(sales / 1000).toFixed(3)}
          />
          <ListItem
            link="#"
            title={labels.profit}
            after={(profit / 1000).toFixed(3)}
          />
          <ListItem
            link="#"
            title={labels.fixedFees}
            after={(fixedFees / 1000).toFixed(3)}
          />
          <ListItem
            link="#"
            title={labels.deliveryFees}
            after={(deliveryFees / 1000).toFixed(3)}
          />
          <ListItem
            link="#"
            title={labels.purchaseDiscounts}
            after={(purchaseDiscounts / 1000).toFixed(3)}
          />
          <ListItem
            link="#"
            title={labels.netProfit}
            after={((profit + fixedFees + deliveryFees + purchaseDiscounts) / 1000).toFixed(3)}
          />
          <ListItem
            link="#"
            title={labels.discounts}
            after={(discounts / 1000).toFixed(3)}
          />
          <ListItem
            link="#"
            title={labels.deliveryDiscounts}
            after={(deliveryDiscounts / 1000).toFixed(3)}
          />
          <ListItem
            link="#"
            title={labels.withdrawals}
            after={(withdrawals / 1000).toFixed(3)}
          />
          <ListItem
            link="#"
            title={labels.expenses}
            after={(expenses / 1000).toFixed(3)}
          />
          <ListItem
            link="#"
            title={labels.donations}
            after={(donations / 1000).toFixed(3)}
          />
          <ListItem
            link="#"
            title={labels.damages}
            after={(damages / 1000).toFixed(3)}
          />
          <ListItem
            link="#"
            title={labels.sellings}
            after={(sellings / 1000).toFixed(3)}
          />
        </List>
      </Block>
      {buttonVisisble ? 
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleMonthlyTrans()}>
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
