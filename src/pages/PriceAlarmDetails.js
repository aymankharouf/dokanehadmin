import React, { useContext, useState, useMemo } from 'react'
import { Page, Navbar, Card, CardContent, CardFooter, List, ListItem, Icon, Fab, Toolbar, Badge, FabButton, FabButtons} from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import { StoreContext } from '../data/Store';
import moment from 'moment'
import 'moment/locale/ar'
import { approvePriceAlarm, rejectPriceAlarm, showMessage } from '../data/Actions'

const PriceAlarmDetails = props => {
  const { state } = useContext(StoreContext)
  const [store, setStore] = useState('')
  const priceAlarm = useMemo(() => state.priceAlarms.find(a => a.id === props.id)
  , [state.priceAlarms, props.id])
  const pack = useMemo(() => state.packs.find(p => p.id === priceAlarm.packId)
  , [state.packs, priceAlarm])
  const product = useMemo(() => state.products.find(p => p.id === pack.productId)
  , [state.products, pack])
  const userInfo = useMemo(() => state.users.find(u => u.id === priceAlarm.userId)
  , [state.users, priceAlarm])
  const customer = useMemo(() => state.customers.find(c => c.id === priceAlarm.userId)
  , [state.customers, priceAlarm])
  const storeName = useMemo(() => customer.type === 'o' ? state.stores.find(s => s.id === customer.storeId).name : priceAlarm.storeName
  , [customer, state.stores, priceAlarm])
  const storeAddress = useMemo(() => customer.type === 'o' ? state.stores.find(s => s.id === customer.storeId).address : priceAlarm.storePlace
  , [customer, state.stores, priceAlarm])
  const stores = useMemo(() => [...state.stores].sort((s1, s2) => s1.name > s2.name ? 1 : -1)
  , [state.stores])
  const prices = useMemo(() => [...pack.stores].sort((s1, s2) => s1.price - s2.price)
  , [pack])
  const handleApprove = () => {
    approvePriceAlarm(priceAlarm, pack, store, customer).then(() => {
      showMessage(props, 'success', state.labels.approveSuccess)
			props.f7router.back()
    })
  }
  const handleReject = () => {
    rejectPriceAlarm(priceAlarm).then(() => {
      showMessage(props, 'success', state.labels.rejectSuccess)
      props.f7router.back()
    })
  }

  return (
    <Page>
      <Navbar title={`${product.name} ${pack.name}`} backLink={state.labels.back} />
      <Fab position="left-top" slot="fixed" color="blue">
        <Icon material="keyboard_arrow_down"></Icon>
        <Icon material="keyboard_arrow_up"></Icon>
        <FabButtons position="bottom">
        {customer.type === 'o' || store ? 
          <FabButton color="green" onClick={() => handleApprove()}>
            <Icon material="done"></Icon>
          </FabButton>
          : '' 
        }
          <FabButton color="red" onClick={() => handleReject()}>
          <Icon material="close"></Icon>
          </FabButton>
        </FabButtons>
      </Fab>
      <Card>
        <CardContent>
          <img src={product.imageUrl} className="img-card" alt={product.name} />
          <p>{`${userInfo.name} ${userInfo.mobile} (${state.customerTypes.find(t => t.id === customer.type).name})`}</p>
          <p>{`${storeName} ${storeAddress}`}</p>
        </CardContent>
        <CardFooter>
          <p>{(priceAlarm.price / 1000).toFixed(3)}</p>
          <p className='price'>{(pack.price / 1000).toFixed(3)}</p>
        </CardFooter>
      </Card>
      {customer.type === 'o' ? '' :
        <List form>
          <ListItem
            title={state.labels.store}
            smartSelect
            smartSelectParams={{
              openIn: 'popup', 
              closeOnSelect: true, 
              searchbar: true, 
              searchbarPlaceholder: state.labels.search,
              popupCloseLinkText: state.labels.close
            }}
          >
            <select name='store' value={store} onChange={e => setStore(e.target.value)}>
              <option value=""></option>
              {stores.map(s => 
                <option key={s.id} value={s.id}>{s.name}</option>
              )}
            </select>
          </ListItem>
        </List>
      }
      <List>
        {prices.map(s => {
          const currentStore = state.stores.find(st => st.id === s.id)
          return (
            <ListItem 
              title={currentStore.name} 
              footer={moment(s.time.toDate()).fromNow()} 
              after={(s.price / 1000).toFixed(3)} 
              key={s.id} 
            >
              {s.quantity ? <Badge slot="title" color='red'>{s.quantity}</Badge> : null}
            </ListItem>
          )
        })}
      </List>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default PriceAlarmDetails
