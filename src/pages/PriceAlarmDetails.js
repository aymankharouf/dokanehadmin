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
  const priceAlarm = useMemo(() => state.priceAlarms.find(rec => rec.id === props.id)
  , [state.priceAlarms, props.id])
  const pack = useMemo(() => state.packs.find(rec => rec.id === priceAlarm.packId)
  , [state.packs, priceAlarm])
  const product = useMemo(() => state.products.find(rec => rec.id === pack.productId)
  , [state.products, pack])
  const userInfo = useMemo(() => state.users.find(rec => rec.id === priceAlarm.user)
  , [state.users, priceAlarm])
  const customer = useMemo(() => state.customers.find(rec => rec.id === priceAlarm.user)
  , [state.customers, priceAlarm])
  const storeName = useMemo(() => customer.type === 'o' ? state.stores.find(rec => rec.id === customer.storeId).name : priceAlarm.storeName
  , [customer, state.stores, priceAlarm])
  const storeAddress = useMemo(() => customer.type === 'o' ? state.stores.find(rec => rec.id === customer.storeId).address : priceAlarm.storePlace
  , [customer, state.stores, priceAlarm])
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
  const storesTags = useMemo(() => {
    const stores = state.stores
    stores.sort((rec1, rec2) => rec1.name > rec2.name ? 1 : -1)
    return stores.map(rec => 
      <option key={rec.id} value={rec.id}>{rec.name}</option>
    )
  }, [state.stores])

  const pricesTags = useMemo(() => {
    let packStores = pack.stores
    packStores.sort((rec1, rec2) => rec1.price - rec2.price)
    packStores = packStores.map(packStore => {
      const currentStore = state.stores.find(rec => rec.id === packStore.id)
      return {...packStore, name: currentStore.name}
    })
    return packStores.map(rec => 
      <ListItem 
        title={rec.name} 
        footer={moment(rec.time.toDate()).fromNow()} 
        after={(rec.price / 1000).toFixed(3)} 
        key={rec.id} 
      >
        {rec.quantity ? <Badge slot="title" color='red'>{rec.quantity}</Badge> : null}
      </ListItem>
    )
  }, [pack, state.stores])
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
          <img src={product.imageUrl} width="100%" height="250" alt=""/>
          <p>{`${userInfo.name} ${userInfo.mobile} (${state.customerTypes.find(rec => rec.id === customer.type).name})`}</p>
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
            <select name='store' value={store} onChange={(e) => setStore(e.target.value)}>
              <option value=""></option>
              {storesTags}
            </select>
          </ListItem>
        </List>
      }
      <List>
        {pricesTags}
      </List>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default PriceAlarmDetails
