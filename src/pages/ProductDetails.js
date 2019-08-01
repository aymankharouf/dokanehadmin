import React, { useContext } from 'react'
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
  const { state, products } = useContext(StoreContext)
  const product = products.find(product => product.id === props.id)
  let productStores = [...product.stores]
  productStores = productStores.sort((productStorea, productStoreb) => productStorea.price - productStoreb.price)
  productStores = productStores.map(productStore => {
    const currentStore = state.stores.find(store => store.id === productStore.id)
    const storeName = currentStore.name
    return {...productStore, name: storeName}
  })
  const storesTag = productStores.map(store => <ListItem header={store.name} title={moment(store.time.toDate()).fromNow()} after={store.price} key={store.id} />)
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
              <Rating rating={product.rating} />
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
      <Fab position="center-bottom" slot="fixed" text="Edit" color="red" onClick={() => handleEditProduct()}>
        <Icon ios="f7:edit" aurora="f7:edit" md="material:edit"></Icon>
      </Fab>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default ProductDetails
