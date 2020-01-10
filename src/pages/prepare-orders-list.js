import React, { useContext, useMemo, useState, useEffect } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, Button } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import { allocateOrderPack, showMessage, getMessage, showError } from '../data/actions'
import labels from '../data/labels'

const PrepareOrdersList = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] =useState(false)
  const orders = useMemo(() => {
    let orders = state.orders.filter(o => props.orderId === '0' ? (o.status === 'f' && o.basket.find(p => p.packId === props.packId && !p.isAllocated)) : o.id === props.orderId)
    orders = orders.map(o => {
      const userInfo = state.users.find(u => u.id === o.userId)
      const customerInfo = state.customers.find(c => c.id === o.userId)
      return {
        ...o,
        userInfo,
        customerInfo
      }
    })
    return orders.sort((o1, o2) => o2.time.seconds - o1.time.seconds)
  }, [state.orders, state.users, state.customers, props.orderId, props.packId])
  const pack = useMemo(() => state.packs.find(p => p.id === props.packId)
  , [state.packs, props.packId])
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

  const handleAllocate = async order => {
    try{
      setInprocess(true)
      await allocateOrderPack(order, pack)
      setInprocess(false)
      showMessage(labels.editSuccess)
      props.f7router.back()
    } catch(err) {
      setInprocess(false)
			setError(getMessage(props, err))
		}
  }
  return(
    <Page>
      <Navbar title={`${pack.productName} ${pack.name}`} backLink={labels.back} />
      <Block>
        <List mediaList>
          {orders.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : orders.map(o => 
              <ListItem
                title={o.customerInfo.fullName || `${o.userinfo.name}:${o.userinfo.mobile}`}
                subtitle={`${labels.quantity}: ${o.basket.find(p => p.packId === props.packId).quantity}`}
                key={o.id}
              >
                <Button slot="after" onClick={() => handleAllocate(o)}>{labels.allocate}</Button>
              </ListItem>
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

export default PrepareOrdersList
