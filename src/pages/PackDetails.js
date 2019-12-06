import React, { useContext, useState, useMemo, useEffect } from 'react'
import { Page, Navbar, Card, CardContent, CardFooter, List, ListItem, Icon, Fab, Toolbar, Badge, FabButton, FabButtons } from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import { StoreContext } from '../data/Store'
import { refreshPackPrice, showMessage, showError, getMessage } from '../data/Actions'
import moment from 'moment'
import 'moment/locale/ar'

const PackDetails = props => {
  const { state, dispatch } = useContext(StoreContext)
  const [error, setError] = useState('')
  const pack = useMemo(() => state.packs.find(p => p.id === props.id)
  , [state.packs, props.id])
  const product = useMemo(() => state.products.find(p => p.id === pack.productId)
  , [state.products, pack])
  const packStores = useMemo(() => {
    const packStores = state.storePacks.filter(p => p.packId === pack.id)
    const today = new Date()
    today.setDate(today.getDate() - 30)
    return packStores.sort((s1, s2) => 
    {
      if (s1.purchasePrice === s2.purchasePrice) {
        const store1 = state.stores.find(s => s.id === s1.storeId)
        const store2 = state.stores.find(s => s.id === s2.storeId)
        if (store1.type === store2.type){
          if (store2.discount === store1.discount) {
            const store1Purchases = state.purchases.filter(p => p.storeId === s1.storeId && p.time.toDate() < today)
            const store2Purchases = state.purchases.filter(p => p.storeId === s2.storeId && p.time.toDate() < today)
            const store1Sales = store1Purchases.reduce((sum, p) => sum + p.total, 0)
            const store2Sales = store2Purchases.reduce((sum, p) => sum + p.total, 0)
            return store1Sales - store2Sales
          } else {
            return Number(store2.discount) - Number(store1.discount)
          }
        } else {
          return Number(store1.type) - Number(store2.type)
        }
      } else {
        return s1.purchasePrice - s2.purchasePrice
      }
    })
  }, [pack, state.storePacks, state.stores, state.purchases])
  useEffect(() => {
    if (error) {
      showError(props, error)
      setError('')
    }
  }, [error, props])
  const handlePurchase = packStore => {
		try{
      if (packStore.storeId === 's') {
        throw new Error('noPurchaseFromStore')
      }
      if (packStore.offerEnd && new Date() > packStore.offerEnd.toDate()) {
        throw new Error('offerEnded')
      }
			if (state.basket.storeId && state.basket.storeId !== packStore.storeId){
				throw new Error('twoDiffStores')
      }
      if (state.basket.packs && state.basket.packs.find(p => p.packId === packStore.packId)) {
        throw new Error('duplicatePacKInBasket')
      }
      if (pack.byWeight) {
        props.f7router.app.dialog.prompt(state.labels.enterWeight, state.labels.actualWeight, async weight => {
          const quantity = pack.isDivided ? Number(weight) : 1
          dispatch({type: 'ADD_TO_BASKET', params: {pack, packStore, quantity, price: packStore.price, orderId: props.orderId, weight: Number(weight)}})
          showMessage(props, state.labels.addToBasketSuccess)
          props.f7router.back()
        })
      } else {
        dispatch({type: 'ADD_TO_BASKET', params: {pack, packStore, quantity: 1, price: packStore.price, orderId: props.orderId}})
        showMessage(props, state.labels.addToBasketSuccess)
        props.f7router.back()
      }
    } catch(err) {
			setError(getMessage(err, state.labels, props.f7route.route.component.name))
		}
	}
  const handleRefreshPrice = async () => {
    try{
      await refreshPackPrice(pack, state.storePacks)
      showMessage(props, state.labels.refreshSuccess)
    } catch(err) {
			setError(getMessage(err, state.labels, props.f7route.route.component.name))
		}
  }
  return (
    <Page>
      <Navbar title={`${product.name} ${pack.name}`} backLink={state.labels.back} />
      <Card>
        <CardContent>
          <img src={product.imageUrl} className="img-card" alt={product.name} />
        </CardContent>
        <CardFooter>
          <p>{(pack.price / 1000).toFixed(3)}</p>
        </CardFooter>
      </Card>
      <List>
      {packStores.map(s => {
        const storeInfo = state.stores.find(st => st.id === s.storeId)
        return (
          <ListItem 
            link="#"
            title={storeInfo.name} 
            footer={moment(s.time.toDate()).fromNow()} 
            after={(s.price / 1000).toFixed(3)} 
            key={s.storeId} 
            onClick={() => handlePurchase(s)}
          >
            {s.quantity ? <Badge slot="title" color='red'>{s.quantity}</Badge> : ''}
            {s.offerEnd ? <Badge slot="title" color='green'>{state.labels.offer}</Badge> : ''}
          </ListItem>
        )
      })}
      </List>
      <Fab position="left-top" slot="fixed" color="orange">
        <Icon material="keyboard_arrow_down"></Icon>
        <Icon material="close"></Icon>
        <FabButtons position="bottom">
          <FabButton color="green" onClick={() => props.f7router.navigate(`/addPackStore/${props.id}`)}>
            <Icon material="add"></Icon>
          </FabButton>
          <FabButton color="blue" onClick={() => props.f7router.navigate(`/editPack/${props.id}`)}>
            <Icon material="edit"></Icon>
          </FabButton>
          <FabButton color="yellow" onClick={() => handleRefreshPrice()}>
            <Icon material="cached"></Icon>
          </FabButton>
          <FabButton color="red" onClick={() => props.f7router.navigate(`/packTrans/${props.id}`)}>
            <Icon material="import_export"></Icon>
          </FabButton>
        </FabButtons>
      </Fab>

      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default PackDetails
