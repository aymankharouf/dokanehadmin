import React, { useContext, useState, useMemo } from 'react'
import { Page, Navbar, Card, CardContent, CardFooter, List, ListItem, Icon, Fab, Badge, BlockTitle, Row, Col, Button } from 'framework7-react'
import Rating from './Rating'
import { StoreContext } from '../data/Store';
import moment from 'moment'
import 'moment/locale/ar'

const ProductDetails = props => {
  const { state } = useContext(StoreContext)
  const product = useMemo(() => state.products.find(rec => rec.id === props.id), [state.products])
  
  const packsTags = useMemo(() => {
    const packs = state.packs.filter(rec => rec.productId === props.id)
    return packs.map(rec => 
      <ListItem 
        title={rec.name} 
        footer={moment(rec.time.toDate()).fromNow()} 
        after={rec.price ? (rec.price / 1000).toFixed(3) : ''} 
        key={rec.id} 
        link={`/packDetails/${rec.id}`}
      >
        {rec.isOffer ? <Badge slot="title" color='red'>{state.labels.offer}</Badge> : ''}
      </ListItem>
    )
  }, [state.packs]) 
  return (
    <Page>
      <Navbar title={product.name} backLink={state.labels.back} />
      <Card>
        <CardContent>
          <img src={product.imageUrl} width="100%" height="250" alt=""/>
        </CardContent>
        <CardFooter>
          <p>{`${state.labels.productOf} ${state.countries.find(rec => rec.id === product.country).name}`}</p>
          <p><Rating rating={product.rating} /></p>
        </CardFooter>
      </Card>
      <BlockTitle>
      <Row>
        <Col>
          {state.labels.packs}
        </Col>
        <Col>
          <Button small fill round iconMaterial="add" onClick={() => props.f7router.navigate(`/addPack/${props.id}`)}></Button>
        </Col>
      </Row>
      </BlockTitle>
      <List>
        {packsTags}
      </List>
      <Fab position="left-top" slot="fixed" color="red" onClick={() => props.f7router.navigate(`/editProduct/${props.id}`)}>
        <Icon material="edit"></Icon>
      </Fab>

    </Page>
  )
}

export default ProductDetails
