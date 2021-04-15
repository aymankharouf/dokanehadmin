import { useContext, useState, useEffect } from 'react'
import { f7, Page, Block, Navbar, List, ListItem, Fab, Icon, Toolbar } from 'framework7-react'
import Footer from './footer'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import moment from 'moment'
import 'moment/locale/ar'
import { paymentTypes } from '../data/config'

const StoreBalanceTrans = (props: any) => {
  const { state } = useContext(StoreContext)
  const [store] = useState(() => state.stores.find((s: any) => s.id === props.storeId))
  const [trans, setTrans] = useState<any>([])
  const month = (Number(props.month) % 100) - 1
  const year = Math.trunc(Number(props.month) / 100)
  useEffect(() => {
    setTrans(() => {
      let storePayments = state.storePayments.filter((p: any) => p.storeId === props.storeId && p.paymentDate.getFullYear() === year && p.paymentDate.getMonth() === month)
      storePayments = storePayments.map((p: any) => {
        const paymentTypeInfo = paymentTypes.find(t => t.id === p.type)!
        return {
          amount: p.amount,
          time: p.paymentDate,
          name: paymentTypeInfo.name
        }
      })
      let purchases = state.purchases.filter((p: any) => p.storeId === props.storeId && (p.time.toDate()).getFullYear() === year && (p.time.toDate()).getMonth() === month)
      purchases = purchases.map((p: any) => {
        return {
          amount: p.total,
          time: p.time,
          name: labels.purchase
        }
      })
      const trans = [...storePayments, ...purchases]
      return trans.sort((t1, t2) => t2.time.seconds - t1.time.seconds)
    })
  }, [store, state.purchases, state.storePayments, props.id, month, year, props.storeId])
  let i = 0
  return(
    <Page>
      <Navbar title={`${labels.balanceTrans} ${store.name} ${year}-${month}`} backLink={labels.back} />
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => f7.views.current.router.navigate(`/add-store-payment/${props.id}`)}>
        <Icon material="add"></Icon>
      </Fab>
      <Block>
        <List mediaList>
          {trans.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : trans.map((t: any) => 
              <ListItem
                title={t.name}
                subtitle={moment(t.time.toDate()).fromNow()}
                after={(t.amount / 100).toFixed(2)}
                key={i++}
              />
            )
          }
        </List>
      </Block>
      <Toolbar bottom>
        <Footer/>
      </Toolbar>
    </Page>
  )
}

export default StoreBalanceTrans
