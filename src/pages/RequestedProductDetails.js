import React, { useContext, useState } from 'react'
import { Block, Page, Navbar, Card, CardContent, List, ListItem, Row, Col, Toolbar} from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import { StoreContext } from '../data/Store';
import moment from 'moment'
import 'moment/locale/ar'

const RequestedProductDetails = props => {
	const { state, products, dispatch } = useContext(StoreContext)
	const [error, setError] = useState('')
  const product = products.find(product => product.id === props.productId)
  let productStores = [...product.stores]
  productStores = productStores.sort((productStorea, productStoreb) => productStorea.purchasePrice - productStoreb.purchasePrice)
  productStores = productStores.map(productStore => {
    const currentStore = state.stores.find(store => store.id === productStore.id)
    const storeName = currentStore.name
    return {...productStore, name: storeName}
	})
	const handlePurchase = store => {
		try{
			if (state.basket.store && state.basket.store.id !== store.id){
				throw 'can not add to basket from two different stores'
      }
      dispatch({type: 'ADD_TO_BASKET', basket: {product, store, quantity: props.quantity}})
			props.f7router.back()
		} catch(err) {
			err.code ? setError(state.labels[err.code.replace(/-|\//g, '_')]) : setError(err)
		}
	}
  const storesTag = productStores.map(store => 
    <ListItem 
			header={store.name} 
			title={moment(store.time.toDate()).fromNow()} 
			after={store.price} 
			key={store.id}
			link="#"
			onClick={() => handlePurchase(store)}
		/>
	)
  return (
    <Page>
      <Navbar title={product.name} backLink="Back" />
      <Block>
        <Card className="demo-card-header-pic">
          <CardContent>
            <img src={product.imageUrl} width="100%" height="250" alt=""/>
            <Row>
            <Col width="20">
              {product.price}
            </Col>
            <Col width="60" className="left">
              {props.quantity} 
            </Col>
            </Row>
            <Row>
              <Col>
                <List>
                  {storesTag}
                </List>
              </Col>
            </Row>
          </CardContent>
        </Card>
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
