import React, { useContext, useState, useMemo, useEffect } from 'react'
import { Block, Page, Navbar, Card, CardContent, List, ListItem, CardFooter, Toolbar, Badge } from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import { StoreContext } from '../data/Store';
import { packUnavailable, showMessage } from '../data/Actions'
import moment from 'moment'
import 'moment/locale/ar'

const RequestedPackDetails = props => {
	const { state, dispatch } = useContext(StoreContext)
	const [error, setError] = useState('')
  const pack = useMemo(() => state.packs.find(rec => rec.id === props.packId)
  , [state.packs, props.packId])
  const product = useMemo(() => state.products.find(rec => rec.id === pack.productId)
  , [state.products, pack])
  useEffect(() => {
    if (error) {
      showMessage(props, 'error', error)
      setError('')
    }
  }, [error, props])

	const handlePurchase = store => {
		try{
			if (state.basket.storeId && state.basket.storeId !== store.id){
				throw new Error(state.labels.twoDiffStores)
      }
      if (state.basket.packs && state.basket.packs.find(rec => rec.id === pack.id)) {
        throw new Error(state.labels.alreadyInBasket)
      }
      if (store.price > Number(props.price)){
        throw new Error(state.labels.priceHigherThanRequested)
      }
      if (store.id === 's' && store.quantity === 0){
        throw new Error(state.labels.unavailableInStock)
      }
      dispatch({type: 'ADD_TO_BASKET', params: {pack, store, quantity: store.quantity ? Math.min(props.quantity, store.quantity) : Number(props.quantity), price: Number(props.price), requestedQuantity: Number(props.quantity)}})
      showMessage(props, 'success', state.labels.addToBasketSuccess)
			props.f7router.back()
		} catch(err) {
			err.code ? setError(state.labels[err.code.replace(/-|\//g, '_')]) : setError(err.message)
		}
  }
  const handleUnavailable = () => {
    const approvedOrders = state.orders.filter(rec => rec.status === 'a' || rec.status === 'e')
    packUnavailable(pack, Number(props.price), approvedOrders).then(() => {
      showMessage(props, 'success', state.labels.executeSuccess)
			props.f7router.back()
    })
  }
  const packStores = useMemo(() => {
    let packStores = pack.stores
    packStores.sort((rec1, rec2) => {
      if (rec1.purchasePrice === rec2.purchasePrice) {
        if (Number(state.stores.find(rec => rec.id === rec2.id).type) === Number(state.stores.find(rec => rec.id === rec1.id).type)){
          return rec1.time.seconds - rec2.time.seconds
        } else {
          return Number(state.stores.find(rec => rec.id === rec1.id).type) - Number(state.stores.find(rec => rec.id === rec2.id).type)
        }
      } else {
        return rec1.purchasePrice - rec2.purchasePrice
      }
    })
    packStores = packStores.map(packStore => {
      const currentStore = state.stores.find(store => store.id === packStore.id)
      const storeName = currentStore.name
      return {...packStore, name: storeName}
    })
    return packStores
  }, [pack, state.stores])

  return (
    <Page>
      <Navbar title={`${product.name} ${pack.name}`} backLink={state.labels.back} />
      <Block>
        <Card>
          <CardContent>
            <img src={product.imageUrl} width="100%" height="250" alt=""/>
          </CardContent>
          <CardFooter>
            <p>{(props.price / 1000).toFixed(3)}</p>
            <p>{props.quantity}</p>
          </CardFooter>
        </Card>
        <List>
          {pack.price > Number(props.price) ? 
            <ListItem 
              link="#"
              title={state.labels.unavailable}
              onClick={() => handleUnavailable()}
            />
            : ''
          }
          {packStores.map(rec => 
            <ListItem 
              link="#"
              title={rec.name} 
              footer={moment(rec.time.toDate()).fromNow()} 
              after={(rec.price / 1000).toFixed(3)} 
              key={rec.id}
              onClick={() => handlePurchase(rec)}
            >
              {rec.quantity ? <Badge slot='title' color='red'>{rec.quantity}</Badge> : ''}
            </ListItem>
          )}
        </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default RequestedPackDetails
