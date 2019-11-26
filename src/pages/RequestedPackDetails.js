import React, { useContext, useState, useMemo, useEffect } from 'react'
import { Block, Page, Navbar, Card, CardContent, List, ListItem, CardFooter, Toolbar, Badge } from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import { StoreContext } from '../data/Store';
import { packUnavailable, showMessage, showError, getMessage } from '../data/Actions'
import moment from 'moment'
import 'moment/locale/ar'

const RequestedPackDetails = props => {
	const { state, dispatch } = useContext(StoreContext)
	const [error, setError] = useState('')
  const pack = useMemo(() => state.packs.find(p => p.id === props.packId)
  , [state.packs, props.packId])
  const product = useMemo(() => state.products.find(p => p.id === pack.productId)
  , [state.products, pack])
  const packStores = useMemo(() => {
    const packStores = state.storePacks.filter(p => p.packId === props.packId)
    return packStores.sort((s1, s2) => 
    {
      if (s1.purchasePrice === s2.purchasePrice) {
        if (Number(state.stores.find(s => s.id === s2.storeId).type) === Number(state.stores.find(s => s.id === s1.storeId).type)){
          return s1.time.seconds - s2.time.seconds
        } else {
          return Number(state.stores.find(s => s.id === s1.storeId).type) - Number(state.stores.find(s => s.id === s2.storeId).type)
        }
      } else {
        return s1.purchasePrice - s2.purchasePrice
      }
    })
  }, [props.packId, state.stores, state.storePacks])
  useEffect(() => {
    if (error) {
      showError(props, error)
      setError('')
    }
  }, [error, props])
	const handlePurchase = packStore => {
		try{
			if (state.basket.storeId && state.basket.storeId !== packStore.id){
				throw new Error(state.labels.twoDiffStores)
      }
      if (state.basket.packs && state.basket.packs.find(p => p.packId === pack.id)) {
        throw new Error(state.labels.alreadyInBasket)
      }
      if (packStore.price > Number(props.price)){
        throw new Error(state.labels.priceHigherThanRequested)
      }
      if (packStore.storeId === 's' && packStore.quantity === 0){
        throw new Error(state.labels.unavailableInStock)
      }
      dispatch({type: 'ADD_TO_BASKET', params: {pack, packStore, quantity: packStore.quantity ? Math.min(props.quantity, packStore.quantity) : Number(props.quantity), price: Number(props.price), requestedQuantity: Number(props.quantity)}})
      showMessage(props, state.labels.addToBasketSuccess)
			props.f7router.back()
    } catch(err) {
			setError(getMessage(err, state.labels, props.f7route.route.component.name))
		}
  }
  const handleUnavailable = () => {
    const approvedOrders = state.orders.filter(o => o.status === 'a' || o.status === 'e')
    packUnavailable(pack, Number(props.price), approvedOrders).then(() => {
      showMessage(props, 'success', state.labels.executeSuccess)
			props.f7router.back()
    })
  }

  return (
    <Page>
      <Navbar title={`${product.name} ${pack.name}`} backLink={state.labels.back} />
      <Block>
        <Card>
          <CardContent>
            <img src={product.imageUrl} className="img-card" alt={product.name} />
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
                {s.quantity ? <Badge slot='title' color='red'>{s.quantity}</Badge> : ''}
              </ListItem>
            )
          })}
        </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default RequestedPackDetails
