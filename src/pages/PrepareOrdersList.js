import React, { useContext, useMemo, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Button } from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import { StoreContext } from '../data/store'
import { allocateOrderPack, showMessage, getMessage, showError } from '../data/actions'

const PrepareOrdersList = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const orders = useMemo(() => {
    const orders = state.orders.filter(o => props.orderId === '0' ? (o.status === 'f' && o.basket.find(p => p.packId === props.packId && !p.isAllocated)) : o.id === props.orderId)
    return orders.sort((o1, o2) => o2.time.seconds - o1.time.seconds)
  }, [state.orders, props.orderId, props.packId])
  const pack = useMemo(() => state.packs.find(p => p.id === props.packId)
  , [state.packs, props.packId])
  const product = useMemo(() => state.products.find(p => p.id === pack.productId)
  , [state.products, pack])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleAllocate = async order => {
    try{
      await allocateOrderPack(order, pack)
      showMessage(state.labels.editSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  return(
    <Page>
      <Navbar title={`${product.name} ${pack.name}`} backLink={state.labels.back} />
      <Block>
        <List mediaList>
          {orders.length === 0 ? 
            <ListItem title={state.labels.noData} /> 
          : orders.map(o => {
              const userInfo = state.users.find(u => u.id === o.userId)
              return (
                <ListItem
                  title={`${state.labels.user}: ${userInfo.name}`}
                  subtitle={`${state.labels.mobile}: ${userInfo.mobile}`}
                  text={`${state.labels.quantity}: ${o.basket.find(p => p.packId === props.packId).quantity}`}
                  key={o.id}
                >
                  <Button slot="after" onClick={() => handleAllocate(o)}>{state.labels.allocate}</Button>
                </ListItem>
              )
            })
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
