import React, { useContext, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import { addMonthlyTrans, showMessage, showError, getMessage } from '../data/actions'
import labels from '../data/labels'

const MonthlyTrans = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [buttonVisisble, setButtonVisible] = useState(false)
  const month = (Number(props.id) % 100) - 1
  const year = Math.trunc(Number(props.id) / 100)
  const [monthlyTrans] = useState(() => state.monthlyTrans.find(t => t.id === props.id))
  const [orders] = useState(() => state.orders.filter(o => ['a', 'e', 'f', 'p', 'd'].includes(o.status) && (o.time.toDate()).getFullYear() === year && (o.time.toDate()).getMonth() === month))
  const [finishedOrders] = useState(() => orders.filter(o => ['f', 'p'].includes(o.status)))
  const [deliveredOrders] = useState(() => orders.filter(o => o.status === 'd'))
  const [ordersCount] = useState(() => monthlyTrans?.ordersCount ?? orders.length)
  const [deliveredOrdersCount] = useState(() => monthlyTrans?.deliveredOrdersCount ?? deliveredOrders.length)
  const [finishedOrdersCount] = useState(() => monthlyTrans?.finishedOrdersCount ?? finishedOrders.length)
  const [stock] = useState(() => {
    if (monthlyTrans) return monthlyTrans.stock
    const stockPacks = state.packPrices.filter(p => p.storeId === 's' && p.quantity > 0)
    return stockPacks.reduce((sum, p) => sum + Math.trunc(p.cost * p.quantity), 0)
  })
  const [sales] = useState(() => monthlyTrans?.sales ?? deliveredOrders.reduce((sum, o) => sum + o.total, 0))
  const [profit] = useState(() => () => monthlyTrans?.profit ?? deliveredOrders.reduce((sum, o) => sum + o.profit, 0))
  const [fixedFees] = useState(() => monthlyTrans?.fixedFees ?? deliveredOrders.reduce((sum, o) => sum + o.fixedFees, 0))
  const [deliveryFees] = useState(() => monthlyTrans?.deliveryFees ?? deliveredOrders.reduce((sum, o) => sum + o.deliveryFees, 0))
  const [fractions] = useState(() => monthlyTrans?.fractions ?? deliveredOrders.reduce((sum, o) => sum + o.fractions, 0))
  const [discounts] = useState(() => monthlyTrans?.discounts ?? deliveredOrders.reduce((sum, o) => sum + (o.discount.type === 's' ? 0 : o.discount.value), 0))
  const [specialDiscounts] = useState(() => monthlyTrans?.specialDiscounts ?? deliveredOrders.reduce((sum, o) => sum + (o.discount.type === 's' ? o.discount.value : 0), 0))
  const [purchaseDiscounts] = useState(() => {
    const purchases = state.purchases.filter(p => (p.time.toDate()).getFullYear() === year && (p.time.toDate()).getMonth() === month)
    return monthlyTrans?.purchasesDiscounts ?? purchases.reduce((sum, p) => sum + p.discount, 0)
  })
  const [spendings] = useState(() => state.spendings.filter(s => (s.spendingDate.toDate()).getFullYear() === year && (s.spendingDate.toDate()).getMonth() === month))
  const [stockTrans] = useState(() => state.stockTrans.filter(t => (t.time.toDate()).getFullYear() === year && (t.time.toDate()).getMonth() === month))
  const [donations] = useState(() => monthlyTrans?.donations ?? stockTrans.reduce((sum, t) => sum + (t.type === 'g' ? t.total : 0), 0))
  const [damages] = useState(() => monthlyTrans?.damages ?? stockTrans.reduce((sum, t) => sum + (t.type === 'd' ? t.total : 0), 0))
  const [sellingLoss] = useState(() => monthlyTrans?.sellingLoss ?? stockTrans.reduce((sum, t) => sum + (t.type === 's' ? t.discount : 0), 0))
  const [withdrawals] = useState(() => {
    if (monthlyTrans) return monthlyTrans.withdrawals
    const withdrawals = spendings.filter(s => s.type === 'w')
    return withdrawals.reduce((sum, s) => sum + s.spendingAmount, 0)
  })
  const [expenses] = useState(() => {
    if (monthlyTrans) return monthlyTrans.expenses
    const expenses = spendings.filter(s => s.type !== 'w')
    return expenses.reduce((sum, s) => sum + s.spendingAmount, 0)
  })
  const [netProfit] = useState(() => monthlyTrans?.netProfit ?? (profit + fixedFees + deliveryFees + purchaseDiscounts) - (discounts + expenses + damages + sellingLoss + fractions))
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
  const handleMonthlyTrans = () => {
    try{
      const trans = {
        id: props.id,
        ordersCount,
        finishedOrdersCount,
        deliveredOrdersCount,
        stock,
        sales,
        profit,
        fixedFees,
        deliveryFees,
        fractions,
        purchaseDiscounts,
        discounts,
        withdrawals,
        expenses,
        donations,
        damages,
        sellingLoss,
        specialDiscounts,
        netProfit
      }
      addMonthlyTrans(trans, state.orders, state.purchases, state.stockTrans)
      showMessage(labels.addSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  return(
    <Page>
      <Navbar title={`${labels.monthlyTrans} ${props.id}`} backLink={labels.back} />
      <Block>
        <List>
          <ListItem
            title={labels.ordersCount}
            after={ordersCount}
          />
          <ListItem
            title={labels.finishedOrdersCount}
            after={finishedOrdersCount}
          />
          <ListItem
            title={labels.deliveredOrdersCount}
            after={deliveredOrdersCount}
          />
          <ListItem
            title={labels.stock}
            after={(stock / 1000).toFixed(3)}
          />
          <ListItem
            title={labels.sales}
            after={(sales / 1000).toFixed(3)}
          />
          <ListItem
            title={labels.profit}
            after={(profit / 1000).toFixed(3)}
          />
          <ListItem
            title={labels.fixedFees}
            after={(fixedFees / 1000).toFixed(3)}
          />
          <ListItem
            title={labels.deliveryFees}
            after={(deliveryFees / 1000).toFixed(3)}
          />
          <ListItem
            title={labels.purchaseDiscounts}
            after={(purchaseDiscounts / 1000).toFixed(3)}
          />
          <ListItem
            title={labels.grossProfit}
            after={((profit + fixedFees + deliveryFees + purchaseDiscounts) / 1000).toFixed(3)}
          />
          <ListItem
            title={labels.discounts}
            after={(discounts / 1000).toFixed(3)}
          />
          <ListItem
            title={labels.fractions}
            after={(fractions / 1000).toFixed(3)}
          />
          <ListItem
            title={labels.expenses}
            after={(expenses / 1000).toFixed(3)}
          />
          <ListItem
            title={labels.damages}
            after={(damages / 1000).toFixed(3)}
          />
          <ListItem
            title={labels.sellingLoss}
            after={(sellingLoss / 1000).toFixed(3)}
          />
          <ListItem
            title={labels.grossLoss}
            after={((discounts + expenses + damages + sellingLoss + fractions) / 1000).toFixed(3)}
          />
          <ListItem
            title={labels.netProfit}
            after={(netProfit / 1000).toFixed(3)}
          />
          <ListItem
            title={labels.specialDiscounts}
            after={(specialDiscounts / 1000).toFixed(3)}
          />
          <ListItem
            title={labels.donations}
            after={(donations / 1000).toFixed(3)}
          />
          <ListItem
            title={labels.donationsBalance}
            after={((Math.trunc(netProfit * 0.2) - donations - specialDiscounts) / 1000).toFixed(3)}
          />
          <ListItem
            title={labels.withdrawals}
            after={(withdrawals / 1000).toFixed(3)}
          />
          <ListItem
            title={labels.propertyBalance}
            after={((Math.trunc(netProfit * 0.8) - withdrawals) / 1000).toFixed(3)}
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
