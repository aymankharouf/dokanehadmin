import React, { useContext, useState } from 'react'
import { Block, Page, Navbar, Card, CardContent, List, ListItem, CardFooter, Toolbar, Badge } from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import { StoreContext } from '../data/Store';
import moment from 'moment'
import 'moment/locale/ar'

const RequestedPackDetails = props => {
	const { state, dispatch } = useContext(StoreContext)
	const [error, setError] = useState('')
  const pack = state.packs.find(rec => rec.id === props.packId)
  const product = state.products.find(rec => rec.id === pack.productId)
  let packStores = [...pack.stores]
  packStores = packStores.sort((packStore1, packStore2) => packStore1.purchasePrice - packStore2.purchasePrice)
  packStores = packStores.map(packStore => {
    const currentStore = state.stores.find(store => store.id === packStore.id)
    const storeName = currentStore.name
    return {...packStore, name: storeName}
	})
	const handlePurchase = store => {
		try{
			if (state.basket.storeId && state.basket.storeId !== store.id){
				throw new Error(state.labels.twoDiffStores)
      }
      dispatch({type: 'ADD_TO_BASKET', basket: {pack, store, quantity: store.quantity ? Math.min(props.quantity, store.quantity) : Number(props.quantity), price: Number(props.price)}})
			props.f7router.back()
		} catch(err) {
			err.code ? setError(state.labels[err.code.replace(/-|\//g, '_')]) : setError(err.message)
		}
	}
  const storesTag = packStores.map(store => 
    <ListItem 
			title={store.name} 
			footer={moment(store.time.toDate()).fromNow()} 
			after={(store.price / 1000).toFixed(3)} 
			key={store.id}
			link="#"
      onClick={() => handlePurchase(store)}
		>
      {store.quantity ? <Badge slot='title' color='red'>{store.quantity}</Badge> : null}
      {store.price <= props.price ? <Badge slot='title' color='green'> $ </Badge> : null}
    </ListItem>
	)
  return (
    <Page>
      <Navbar title={`${product.name} ${pack.name}`} backLink={state.labels.back} />
      <Block>
        <Card className="demo-card-header-pic">
          <CardContent>
            <img src={product.imageUrl} width="100%" height="250" alt=""/>
          </CardContent>
          <CardFooter>
            <p>{(props.price / 1000).toFixed(3)}</p>
            <p>{props.quantity}</p>
          </CardFooter>
        </Card>
        <List>
          {storesTag}
        </List>
      </Block>
      {error ? <Block strong className="error">{error}</Block> : null}
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default RequestedPackDetails
