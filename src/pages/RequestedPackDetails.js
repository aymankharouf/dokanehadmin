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
  const pack = useMemo(() => state.packs.find(p => p.id === props.packId)
  , [state.packs, props.packId])
  const product = useMemo(() => state.products.find(p => p.id === pack.productId)
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
      if (state.basket.packs && state.basket.packs.find(p => p.id === pack.id)) {
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
    const approvedOrders = state.orders.filter(o => o.status === 'a' || o.status === 'e')
    packUnavailable(pack, Number(props.price), approvedOrders).then(() => {
      showMessage(props, 'success', state.labels.executeSuccess)
			props.f7router.back()
    })
  }
  const packStores = useMemo(() => {
    let packStores = pack.stores
    packStores.sort((s1, s2) => {
      if (s1.purchasePrice === s2.purchasePrice) {
        if (Number(state.stores.find(s => s.id === s2.id).type) === Number(state.stores.find(s => s.id === s1.id).type)){
          return s1.time.seconds - s2.time.seconds
        } else {
          return Number(state.stores.find(s => s.id === s1.id).type) - Number(state.stores.find(s => s.id === s2.id).type)
        }
      } else {
        return s1.purchasePrice - s2.purchasePrice
      }
    })
    packStores = packStores.map(s => {
      const currentStore = state.stores.find(st => st.id === s.id)
      return {...s, name: currentStore.name}
    })
    return packStores
  }, [pack, state.stores])

  return (
    <Page>
      <Navbar title={`${product.name} ${pack.name}`} backLink={state.labels.back} />
      <Block>
        <Card>
          <CardContent>
            <img src={product.imageUrl} width="100%" height="250" alt={product.name} />
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
          {packStores.map(s => 
            <ListItem 
              link="#"
              title={s.name} 
              footer={moment(s.time.toDate()).fromNow()} 
              after={(s.price / 1000).toFixed(3)} 
              key={s.id}
              onClick={() => handlePurchase(s)}
            >
              {s.quantity ? <Badge slot='title' color='red'>{s.quantity}</Badge> : ''}
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
