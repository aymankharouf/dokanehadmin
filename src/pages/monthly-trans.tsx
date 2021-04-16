import { useContext, useState, useEffect } from 'react'
import { f7,Page, Block, Navbar, List, ListItem, Fab, Icon, Toolbar } from 'framework7-react'
import Footer from './footer'
import { StoreContext } from '../data/store'
import { addMonthlyTrans, showMessage, showError, getMessage } from '../data/actions'
import labels from '../data/labels'

const MonthlyTrans = (props: any) => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [buttonVisisble, setButtonVisible] = useState(false)
  const month = (Number(props.id) % 100) - 1
  const year = Math.trunc(Number(props.id) / 100)
  const [monthlyTrans] = useState(() => state.monthlyTrans.find((t: any) => t.id === props.id))
  const [orders] = useState(() => state.orders.filter((o: any) => ['a', 'e', 'f', 'p', 'd'].includes(o.status) && (o.time.toDate()).getFullYear() === year && (o.time.toDate()).getMonth() === month))
  const [finishedOrders] = useState(() => orders.filter((o: any) => ['f', 'p'].includes(o.status)))
  const [deliveredOrders] = useState(() => orders.filter((o: any) => o.status === 'd'))
  const [ordersCount] = useState(() => monthlyTrans?.ordersCount ?? orders.length)
  const [deliveredOrdersCount] = useState(() => monthlyTrans?.deliveredOrdersCount ?? deliveredOrders.length)
  const [finishedOrdersCount] = useState(() => monthlyTrans?.finishedOrdersCount ?? finishedOrders.length)
  const [stock] = useState(() => {
    if (monthlyTrans) return monthlyTrans.stock
    const stockPacks = state.packPrices.filter((p: any) => p.storeId === 's' && p.quantity > 0)
    return stockPacks.reduce((sum: any, p: any) => sum + Math.round(p.cost * p.quantity), 0)
  })
  const [sales] = useState(() => monthlyTrans?.sales ?? deliveredOrders.reduce((sum: any, o: any) => sum + o.total, 0))
  const [transProfit] = useState(() => monthlyTrans?.transProfit ?? deliveredOrders.reduce((sum: any, o: any) => sum + o.profit, 0))
  const [fixedFees] = useState(() => monthlyTrans?.fixedFees ?? deliveredOrders.reduce((sum: any, o: any) => sum + o.fixedFees, 0))
  const [deliveryFees] = useState(() => monthlyTrans?.deliveryFees ?? deliveredOrders.reduce((sum: any, o: any) => sum + o.deliveryFees, 0))
  const [fractions] = useState(() => monthlyTrans?.fractions ?? deliveredOrders.reduce((sum: any, o: any) => sum + o.fraction, 0))
  const [discounts] = useState(() => monthlyTrans?.discounts ?? deliveredOrders.reduce((sum: any, o: any) => sum + (o.discount.type === 's' ? 0 : o.discount.value), 0))
  const [specialDiscounts] = useState(() => monthlyTrans?.specialDiscounts ?? deliveredOrders.reduce((sum: any, o: any) => sum + (o.discount.type === 's' ? o.discount.value : 0), 0))
  const [storesBalance] = useState(() => {
    let sum = 0
    state.stores.forEach((s: any) => {
      sum += s.balances?.filter((b: any) => b.month === year * 100 + month)?.reduce((sum: any, b: any) => sum + b.balance, 0) || 0
    })
    return monthlyTrans?.storesBalance ?? sum
  })
  const [storePayments] = useState(() => state.storePayments.filter((p: any) => (p.paymentDate.toDate()).getFullYear() === year && (p.paymentDate.toDate()).getMonth() === month))
  const [storesProfit] = useState(() => monthlyTrans?.storesProfit ?? storePayments.reduce((sum: any, p: any) => sum + (p.type === 'c' ? p.amount : 0), 0))
  const [storeTransNet] = useState(() => monthlyTrans?.storeTransNet ?? storePayments.reduce((sum: any, p: any) => sum + ['pp', 'sp', 'rp'].includes(p.type) ? -1 * p.amount : (['pl', 'sl', 'rl'].includes(p.type) ? p.amount : 0), 0))
  const [expenses] = useState(() => {
    if (monthlyTrans) return monthlyTrans.expenses
  })
  const [netProfit] = useState(() => monthlyTrans?.netProfit ?? (transProfit + storesProfit + storeTransNet + fixedFees + deliveryFees) - (discounts + expenses + fractions))
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
        transProfit,
        fixedFees,
        deliveryFees,
        fractions,
        storesBalance,
        discounts,
        expenses,
        storesProfit,
        storeTransNet,
        specialDiscounts,
        netProfit
      }
      addMonthlyTrans(trans, state.orders)
      showMessage(labels.addSuccess)
      f7.views.current.router.back()
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  return(
    <Page>
      <Navbar title={`${labels.monthlyTrans} ${month + 1}-${year}`} backLink={labels.back} />
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
            after={(stock / 100).toFixed(2)}
          />
          <ListItem
            title={labels.sales}
            after={(sales / 100).toFixed(2)}
          />
          <ListItem
            title={labels.transProfit}
            after={(transProfit / 100).toFixed(2)}
          />
          <ListItem
            title={labels.storesProfit}
            after={(storesProfit / 100).toFixed(2)}
          />
          <ListItem
            title={labels.fixedFees}
            after={(fixedFees / 100).toFixed(2)}
          />
          <ListItem
            title={labels.deliveryFees}
            after={(deliveryFees / 100).toFixed(2)}
          />
          <ListItem
            title={labels.storesBalance}
            after={(storesBalance / 100).toFixed(2)}
          />
          <ListItem
            title={labels.grossProfit}
            after={((transProfit + storesProfit + storeTransNet + fixedFees + deliveryFees) / 100).toFixed(2)}
          />
          <ListItem
            title={labels.discounts}
            after={(discounts / 100).toFixed(2)}
          />
          <ListItem
            title={labels.fractions}
            after={(fractions / 100).toFixed(2)}
          />
          <ListItem
            title={labels.expenses}
            after={(expenses / 100).toFixed(2)}
          />
          <ListItem
            title={labels.storeTransNet}
            after={(storeTransNet / 100).toFixed(2)}
          />
          <ListItem
            title={labels.grossLoss}
            after={((discounts + expenses + fractions) / 100).toFixed(2)}
          />
          <ListItem
            title={labels.netProfit}
            after={(netProfit / 100).toFixed(2)}
          />
          <ListItem
            title={labels.specialDiscount}
            after={(specialDiscounts / 100).toFixed(2)}
          />
          <ListItem
            title={labels.donationsBalance}
            after={((Math.round(netProfit * 0.2) - specialDiscounts) / 100).toFixed(2)}
          />
          <ListItem
            title={labels.propertyBalance}
            after={((netProfit - Math.round(netProfit * 0.2)) / 100).toFixed(2)}
          />
        </List>
      </Block>
      {buttonVisisble ? 
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleMonthlyTrans()}>
          <Icon material="done"></Icon>
        </Fab>
      : ''}
      <Toolbar bottom>
        <Footer/>
      </Toolbar>
    </Page>
  )
}

export default MonthlyTrans
