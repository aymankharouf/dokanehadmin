import React, { useContext, useState, useMemo, useEffect } from 'react'
import { Page, Navbar, Card, CardContent, CardFooter, List, ListItem, Icon, Fab, Toolbar, Badge, FabButton, FabButtons} from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import { StoreContext } from '../data/Store';
import moment from 'moment'
import 'moment/locale/ar'
import { approvePriceAlarm, rejectPriceAlarm, showMessage, showError, getMessage } from '../data/Actions'
import PackImage from './PackImage'

const PriceAlarmDetails = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
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
  const storeName = useMemo(() => customer.storeId ? state.stores.find(s => s.id === customer.storeId).name : priceAlarm.storeName
  , [customer, state.stores, priceAlarm])
  const storeLocation = useMemo(() => {
    const location = customer.storeId ? state.stores.find(s => s.id === customer.storeId).locationId : priceAlarm.locationId
    return state.locations.find(l => l.id === location).name
  }, [customer, state.stores, state.locations, priceAlarm])
  const stores = useMemo(() => [...state.stores].sort((s1, s2) => s1.name > s2.name ? 1 : -1)
  , [state.stores])
  const prices = useMemo(() => {
    const storePacks = state.storePacks.filter(p => p.packId === pack.id)
    return storePacks.sort((p1, p2) => p1.price - p2.price)
  }, [state.storePacks, pack])
  useEffect(() => {
    if (error) {
      showError(props, error)
      setError('')
    }
  }, [error, props])

  const handleApprove = async () => {
    try{
      await approvePriceAlarm(priceAlarm, pack, store, customer, state.storePacks, state.packs)
      showMessage(props, state.labels.approveSuccess)
			props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  const handleReject = async () => {
    try{
      await rejectPriceAlarm(priceAlarm)
      showMessage(props, state.labels.rejectSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
		}
  }

  return (
    <Page>
      <Navbar title={`${product.name} ${pack.name}`} backLink={state.labels.back} />
      <Fab position="left-top" slot="fixed" color="blue" className="top-fab">
        <Icon material="keyboard_arrow_down"></Icon>
        <Icon material="keyboard_arrow_up"></Icon>
        <FabButtons position="bottom">
          {customer.storeId || store ? 
            <FabButton color="green" onClick={() => handleApprove()}>
              <Icon material="done"></Icon>
            </FabButton>
          : ''}
          <FabButton color="red" onClick={() => handleReject()}>
          <Icon material="close"></Icon>
          </FabButton>
        </FabButtons>
      </Fab>
      <Card>
        <CardContent>
          <PackImage pack={pack} type="card" />
          <p>{`${userInfo.name} ${userInfo.mobile}`}</p>
          <p>{`${state.labels.storeName}: ${storeName}`}</p>
          <p>{`${state.labels.location}: ${storeLocation}`}</p>
        </CardContent>
        <CardFooter>
          <p>{(priceAlarm.price / 1000).toFixed(3)}</p>
          <p className='price'>{(pack.price / 1000).toFixed(3)}</p>
        </CardFooter>
      </Card>
      {customer.storeId ? '' :
        <List form>
          <ListItem
            title={state.labels.store}
            smartSelect
            smartSelectParams={{
              openIn: "popup", 
              closeOnSelect: true, 
              searchbar: true, 
              searchbarPlaceholder: state.labels.search,
              popupCloseLinkText: state.labels.close
            }}
          >
            <select name="store" value={store} onChange={e => setStore(e.target.value)}>
              <option value=""></option>
              {stores.map(s => 
                <option key={s.id} value={s.id}>{s.name}</option>
              )}
            </select>
          </ListItem>
        </List>
      }
      <List>
        {prices.map(p => {
          const currentStore = state.stores.find(st => st.id === p.storeId)
          return (
            <ListItem 
              title={currentStore.name} 
              footer={moment(p.time.toDate()).fromNow()} 
              after={(p.price / 1000).toFixed(3)} 
              key={p.id} 
            >
              {p.quantity ? 
                <Badge slot="title" color='red'>{p.quantity}</Badge> 
              : ''}
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
