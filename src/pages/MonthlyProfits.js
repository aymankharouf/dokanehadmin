import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store'


const MonthlyProfits = props => {
  const { state } = useContext(StoreContext)
  const deliveredOrders = useMemo(() => state.orders.filter(rec => rec.status === 'r' && rec.statusTime.fotmat('YYYYMM') === props.id)
  , [state.orders, props.id])
  const ordersCount = deliveredOrders.length
  const storePacks = useMemo(() => {
    const storePacks = state.packs.filter(pack => pack.stores.find(store => store.id === 's'))
    const storeValue = storePacks.reduce((a, pack) => a + (pack.purchasePrice * pack.quantity), 0)
    return (storeValue / 1000).toFixed(3)
  }, [state.packs])
  const sales = useMemo(() => {
    const sales = deliveredOrders.reduce((a, order) => a + order.total, 0)
    return (sales / 1000).toFixed(3)
  }, [deliveredOrders])
  const profit = useMemo(() => {
    const profit = deliveredOrders.reduce((a, order) => a + order.profit, 0)
    return (profit / 1000).toFixed(3)
  }, [deliveredOrders])
  const fixedFeesTotal = (ordersCount * state.labels.fixedFees / 1000).toFixed(3)
  const deliveryFeesTotal = useMemo(() => {
    const deliveryFees = deliveredOrders.reduce((a, order) => a + order.deliveryFees, 0)
    return (deliveryFees / 1000).toFixed(3)
  }, [deliveredOrders])
  const netProfit = profit + fixedFeesTotal + deliveryFeesTotal
  const specialDiscounts = useMemo(() => {
    const specialDiscount = deliveredOrders.reduce((a, order) => a + (order.discount && order.discount.type === 's' ? order.discount.value : 0) , 0)
    return (specialDiscount / 1000).toFixed(3)
  }, [deliveredOrders])
  const firstOrderDiscounts = useMemo(() => {
    const firstOrderDiscounts = deliveredOrders.reduce((a, order) => a + (order.discount && order.discount.type === 'f' ? order.discount.value : 0) , 0)
    return (firstOrderDiscounts / 1000).toFixed(3)
  }, [deliveredOrders])
  const invitationsDiscounts = useMemo(() => {
    const invitationsDiscounts = deliveredOrders.reduce((a, order) => a + (order.discount && order.discount.type === 'i' ? order.discount.value : 0) , 0)
    return (invitationsDiscounts / 1000).toFixed(3)
  }, [deliveredOrders])
  const priceAlarmsDiscounts = useMemo(() => {
    deliveredOrders.reduce((a, order) => a + (order.discount && order.discount.type === 'p' ? order.discount.value : 0) , 0)
    return (deliveredOrders / 1000).toFixed(3)
  }, [deliveredOrders])
  return(
    <Page>
      <Navbar title={`${state.labels.costs} - ${props.id}`} backLink={state.labels.back} />
      <Block>
        <List>
          <ListItem
            link="#"
            title={state.labels.ordersCount}
            after={ordersCount}
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
            title={state.labels.fixedFeesTotal}
            after={(fixedFeesTotal / 1000).toFixed(3)}
          />
          <ListItem
            link="#"
            title={state.labels.deliveryFeesTotal}
            after={(deliveryFeesTotal / 1000).toFixed(3)}
          />
          <ListItem
            link="#"
            title={state.labels.netProfit}
            after={(netProfit / 1000).toFixed(3)}
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
        </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default MonthlyProfits
