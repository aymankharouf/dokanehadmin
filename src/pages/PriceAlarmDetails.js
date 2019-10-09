import React, { useContext, useState, useMemo } from 'react'
import { Page, Navbar, Card, CardContent, CardFooter, List, ListItem, Icon, Fab, Toolbar, Badge, FabButton, FabButtons} from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import { StoreContext } from '../data/Store';
import moment from 'moment'
import 'moment/locale/ar'
import { approveStorePrice } from '../data/Actions'

const PriceAlarmDetails = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const priceAlarm = useMemo(() => state.priceAlarms.find(rec => rec.id === props.id), [state.priceAlarms])
  const pack = useMemo(() => state.packs.find(rec => rec.id === priceAlarm.packId), [state.packs])
  const product = useMemo(() => state.products.find(rec => rec.id === pack.productId), [state.products])
  const userInfo = useMemo(() => state.users.find(rec => rec.id === priceAlarm.user), [state.users])
  const customer = useMemo(() => state.customers.find(rec => rec.id === priceAlarm.user), [state.customers])
  const storeName = useMemo(() => customer.type === 'o' ? state.stores.find(rec => rec.id === customer.storeId).name : priceAlarm.storeName, [customer, state.stores])
  const handleApprove = () => {
			props.f7router.back()
  }
  const handleReject = () => {
    props.f7router.back()
}
  const storesTags = useMemo(() => {
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
        <Icon ios="f7:chevron_down" aurora="f7:chevron_down" md="material:keyboard_arrow_down"></Icon>
        <Icon ios="f7:chevron_up" aurora="f7:chevron_up" md="material:keyboard_arrow_up"></Icon>
        <FabButtons position="bottom">
          <FabButton color="green" onClick={() => handleApprove()}>
            <Icon ios="f7:check" aurora="f7:check" md="material:done"></Icon>
          </FabButton>
          <FabButton color="red" onClick={() => handleReject()}>
          <Icon ios="f7:close" aurora="f7:close" md="material:close"></Icon>
          </FabButton>
        </FabButtons>
      </Fab>
      <Card className="demo-card-header-pic">
        <CardContent>
          <img src={product.imageUrl} width="100%" height="250" alt=""/>
          <p>{`${userInfo.name} ${userInfo.mobile}`}</p>
          <p>{`${storeName} ${priceAlarm.storePlace}`}</p>
        </CardContent>
        <CardFooter>
          <p>{(priceAlarm.price / 1000).toFixed(3)}</p>
          <p className='price'>{(pack.price / 1000).toFixed(3)}</p>
        </CardFooter>
      </Card>
      <List>
        {storesTags}
      </List>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default PriceAlarmDetails
