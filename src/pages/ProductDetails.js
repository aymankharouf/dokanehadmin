import React, { useContext, useState } from 'react'
import { Block, Page, Navbar, Card, CardContent, CardFooter, List, ListItem, Icon, Row, Col, Fab, Toolbar} from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import Rating from './Rating'
import { StoreContext } from '../data/Store';
import moment from 'moment'
import 'moment/locale/ar'

const ProductDetails = props => {
  const handleEditProduct = () => {
    props.f7router.navigate(`/editProduct/${props.id}`)
  }
  const handlePurchase = store => {
		try{
			if (state.basket.store && state.basket.store.id !== store.id){
				throw 'can not add to basket from two different stores'
      }
      dispatch({type: 'ADD_TO_BASKET', basket: {product, store, quantity: 1, price: store.price}})
			props.f7router.back()
		} catch(err) {
			err.code ? setError(state.labels[err.code.replace(/-|\//g, '_')]) : setError(err)
		}
	}
  const { state, products, dispatch } = useContext(StoreContext)
  const [error, setError] = useState('')
  const product = products.find(product => product.id === props.id)
  let productStores = [...product.stores]
  productStores = productStores.sort((productStorea, productStoreb) => productStorea.price - productStoreb.price)
  productStores = productStores.map(productStore => {
    const currentStore = state.stores.find(store => store.id === productStore.id)
    const storeName = currentStore.name
    return {...productStore, name: storeName}
  })
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
      <Fab position="left-top" slot="fixed" color="red" onClick={() => handleEditProduct()}>
        <Icon ios="f7:edit" aurora="f7:edit" md="material:edit"></Icon>
      </Fab>
      <Block>
        <Card className="demo-card-header-pic">
          <CardContent>
            <img src={product.imageUrl} width="100%" height="250" alt=""/>
            <Row>
            <Col width="20">
              {product.price}
            </Col>
            <Col width="60" className="left">
              <Rating rating={product.rating} />
            </Col>
            </Row>
          </CardContent>
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

export default ProductDetails
