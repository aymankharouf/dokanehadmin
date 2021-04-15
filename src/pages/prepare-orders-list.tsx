import { useContext, useState, useEffect } from 'react'
import { f7, Page, Block, Navbar, List, ListItem, Button, Toolbar } from 'framework7-react'
import Footer from './footer'
import { StoreContext } from '../data/store'
import { allocateOrderPack, showMessage, getMessage, showError } from '../data/actions'
import labels from '../data/labels'

const PrepareOrdersList = (props: any) => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [orders, setOrders] = useState([])
  const [pack] = useState(() => state.packs.find((p: any) => p.id === props.packId))
  useEffect(() => {
    setOrders(() => {
      let orders = state.orders.filter((o: any) => o.id === props.orderId || (props.orderId === '0' && o.status === 'f' && o.basket.find((p: any) => p.packId === props.packId && !p.isAllocated)))
      orders = orders.map((o: any) => {
        const customerInfo = state.customers.find((c: any) => c.id === o.userId)
        const basketInfo = o.basket.find((p: any) => p.packId === props.packId)
        return {
          ...o,
          customerInfo,
          basketInfo
        }
      })
      return orders.sort((o1: any, o2: any) => o2.time.seconds - o1.time.seconds)
    })
  }, [state.orders, state.customers, props.orderId, props.packId])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleAllocate = (order: any) => {
    try{
      allocateOrderPack(order, pack)
      showMessage(labels.editSuccess)
      f7.views.current.router.back()
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  return(
    <Page>
      <Navbar title={`${pack.productName} ${pack.name}`} backLink={labels.back} />
      <Block>
        <List mediaList>
          {orders.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : orders.map((o: any) => 
              <ListItem
                title={o.customerInfo.name}
                subtitle={`${labels.quantity}: ${o.basketInfo.weight || o.basketInfo.quantity}`}
                key={o.id}
              >
                <Button text={labels.allocate} slot="after" onClick={() => handleAllocate(o)} />
              </ListItem>
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

export default PrepareOrdersList
