import React, { useContext, useState } from 'react'
import { Page, Navbar, Card, CardContent, CardFooter, List, ListItem, Icon, Fab, Toolbar, Badge, FabButton, FabButtons} from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import { StoreContext } from '../data/Store';
import moment from 'moment'
import 'moment/locale/ar'

const PriceAlarmDetails = props => {
  const { state, dispatch } = useContext(StoreContext)
  const [error, setError] = useState('')
  const priceAlarm = state.priceAlarms.find(rec => rec.id === props.id)
  const pack = state.packs.find(rec => rec.id === priceAlarm.packId)
  const product = state.products.find(rec => rec.id === pack.productId)
  const userInfo = state.users.find(rec => rec.id === priceAlarm.user)
  const customer = state.customers.find(rec => rec.id === priceAlarm.user)
  const storeName = customer.type === 'o' ? state.stores.find(rec => rec.id === customer.storeId).name : priceAlarm.storeName
  let packStores = pack.stores
  packStores = packStores.sort((packStore1, packStore2) => packStore1.price - packStore2.price)
  packStores = packStores.map(packStore => {
    const currentStore = state.stores.find(rec => rec.id === packStore.id)
    return {...packStore, name: currentStore.name}
  })
  const handlePurchase = store => {
		try{
      if (store.id === 's') return
			if (state.basket.store && state.basket.store.id !== store.id){
				throw new Error(state.labels.twoDiffStores)
      }
      dispatch({type: 'ADD_TO_BASKET', basket: {pack, store, quantity: 1, price: store.price}})
			props.f7router.back()
		} catch(err) {
			err.code ? setError(state.labels[err.code.replace(/-|\//g, '_')]) : setError(err.message)
		}
	}
  const storesTags = packStores.map(store => 
    <ListItem 
      title={store.name} 
      footer={moment(store.time.toDate()).fromNow()} 
      after={(store.price / 1000).toFixed(3)} 
      key={store.id} 
      link="#"
      onClick={() => handlePurchase(store)}
    >
      {store.quantity ? <Badge slot="title" color='red'>{store.quantity}</Badge> : null}
    </ListItem>
  )
  return (
    <Page>
      <Navbar title={`${product.name} ${pack.name}`} backLink={state.labels.back} />
      <Fab position="left-top" slot="fixed" color="blue">
        <Icon ios="f7:chevron_down" aurora="f7:chevron_down" md="material:keyboard_arrow_down"></Icon>
        <Icon ios="f7:chevron_up" aurora="f7:chevron_up" md="material:keyboard_arrow_up"></Icon>
        <FabButtons position="bottom">
          <FabButton color="green" onClick={() => handlePurchase(1)}>
            <Icon ios="f7:check" aurora="f7:check" md="material:done"></Icon>
          </FabButton>
          <FabButton color="red" onClick={() => handlePurchase(-1)}>
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
