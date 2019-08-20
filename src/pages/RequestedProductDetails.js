import React, { useContext, useState } from 'react'
import { Block, Page, Navbar, Card, CardContent, List, ListItem, CardFooter, Toolbar, Badge, Icon} from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import { StoreContext } from '../data/Store';
import moment from 'moment'
import 'moment/locale/ar'

const RequestedProductDetails = props => {
	const { state, products, dispatch } = useContext(StoreContext)
	const [error, setError] = useState('')
  const product = products.find(product => product.id === props.productId)
  let productStores = [...product.stores]
  productStores = productStores.sort((productStore1, productStore2) => productStore1.purchasePrice - productStore2.purchasePrice)
  productStores = productStores.map(productStore => {
    const currentStore = state.stores.find(store => store.id === productStore.id)
    const storeName = currentStore.name
    return {...productStore, name: storeName}
	})
	const handlePurchase = store => {
		try{
			if (state.basket.storeId && state.basket.storeId !== store.id){
				throw 'can not add to basket from two different stores'
      }
      dispatch({type: 'ADD_TO_BASKET', basket: {product, store, quantity: store.quantity ? Math.min(props.quantity, store.quantity) : Number(props.quantity), price: Number(props.price)}})
			props.f7router.back()
		} catch(err) {
			err.code ? setError(state.labels[err.code.replace(/-|\//g, '_')]) : setError(err)
		}
	}
  const storesTag = productStores.map(store => 
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
      <Navbar title={`${product.name} ${product.description}`} backLink="Back" />
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
			<Block strong className="error">
        <p>{error}</p>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default RequestedProductDetails
