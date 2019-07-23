import React, { useContext } from 'react'
import { Block, Page, Navbar, Card, CardContent, CardFooter, Icon, Row, Col, Fab, Toolbar} from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import RateProduct from './RateProduct'
import Rating from './Rating'
import { StoreContext } from '../data/Store';

const ProductDetails = props => {
  const handleAddProduct = () => {
    dispatch({type: 'ADD_TO_BASKET', product})
    props.f7router.back()
  }
  const { products, rating, currentUser, dispatch } = useContext(StoreContext)
  const product = products.find(product => product.id === props.id)
  const rating_links = currentUser && rating.findIndex(rating => rating.productId === props.id) === -1 ? <RateProduct product={product}/> : null
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
            <p>Quisque eget vestibulum nulla. Quisque quis dui quis ex ultricies efficitur vitae non felis. Phasellus quis nibh hendrerit...</p>
          </CardContent>
          <CardFooter>
            {rating_links}
          </CardFooter>
        </Card>
      </Block>
      <Fab position="center-bottom" slot="fixed" text="Create" color="red" onClick={() => handleAddProduct()}>
        <Icon ios="f7:add" aurora="f7:add" md="material:add"></Icon>
      </Fab>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default ProductDetails
