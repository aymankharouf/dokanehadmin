import React, { useContext, useState, useEffect } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { addStorePayment, showMessage, showError, getMessage } from '../data/actions'
import moment from 'moment'
import 'moment/locale/ar'

const StoreBalance = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [store, setStore] = useState(() => state.stores.find(s => s.id === props.id))
  const [trans, setTrans] = useState([])
  useEffect(() => {
    setStore(() => state.stores.find(s => s.id === props.id))
  }, [state.stores, props.id])
  useEffect(() => {
    setTrans(() => {
      let payments = store.payments?.slice() || []
      payments = payments.map(p => {
        return {
          ...p,
          name: labels.payment
        }
      })
      let purchases = state.purchases.filter(p => p.storeId === props.id)
      purchases = purchases.map(p => {
        return {
          amount: p.total - p.discount,
          time: p.time,
          name: labels.purchase
        }
      })
      let stockTrans = state.stockTrans.filter(t => t.storeId === props.id && t.type === 's')
      stockTrans = stockTrans.map(t => {
        return {
          amount: t.total - t.discount,
          time: t.time,
          name: labels.sale
        }
      })
      const trans = [...payments, ...purchases, ...stockTrans]
      return trans.sort((t1, t2) => t2.time.seconds - t1.time.seconds)
    })
  }, [store, state.purchases, state.stockTrans, props.id])
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

  const handlePayment = () => {
    f7.dialog.prompt(labels.enterAmount, labels.amount, async amount => {
      try{
        if (Number(amount) <= 0) {
          throw new Error('invalidValue')
        }
        setInprocess(true)
        await addStorePayment(store.id, amount * 1000)
        setInprocess(false)
        showMessage(labels.addSuccess)
      } catch(err) {
        setInprocess(false)
        setError(getMessage(props, err))
      }
    })
  }
  let i = 0
  return(
    <Page>
      <Navbar title={`${labels.balanceTrans} ${store.name}`} backLink={labels.back} />
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handlePayment()}>
        <Icon material="add"></Icon>
      </Fab>
      <Block>
        <List mediaList>
          {trans.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : trans.map(t => 
              <ListItem
                title={t.name}
                subtitle={moment(t.time.toDate()).fromNow()}
                after={(t.amount / 1000).toFixed(3)}
                key={i++}
              />
            )
          }
        </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default StoreBalance
