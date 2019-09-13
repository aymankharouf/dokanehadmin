import React, { useContext, useState } from 'react'
import { Block, Page, Navbar, Card, CardContent, CardFooter, List, ListItem, Icon, Fab, Toolbar, Badge, BlockTitle, Row, Col, Button } from 'framework7-react'
import Rating from './Rating'
import { StoreContext } from '../data/Store';
import moment from 'moment'
import 'moment/locale/ar'
import BottomToolbar from './BottomToolbar'

const ProductDetails = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const product = state.products.find(rec => rec.id === props.id)
  const packs = state.packs.filter(rec => rec.productId === props.id)
  const packsTags = packs.map(pack => 
    <ListItem 
      title={pack.name} 
      footer={moment(pack.time.toDate()).fromNow()} 
      after={pack.price ? (pack.price / 1000).toFixed(3) : ''} 
      key={pack.id} 
      link={`/packDetails/${pack.id}`}
    >
      {pack.isOffer ? <Badge slot="title" color='red'>{state.labels.offer}</Badge> : null}
    </ListItem>
  )
  return (
    <Page>
      <Navbar title={product.name} backLink="Back" />
      <Block>
        <Card className="demo-card-header-pic">
          <CardContent>
            <img src={product.imageUrl} width="100%" height="250" alt=""/>
          </CardContent>
          <CardFooter>
            <p><Rating rating={product.rating} /></p>
          </CardFooter>
        </Card>
        <BlockTitle>
        <Row>
          <Col>
            {state.labels.packs}
          </Col>
          <Col>
            <Button small fill round iconIos="f7:add" iconAurora="f7:add" iconMd="material:add" onClick={() => props.f7router.navigate(`/addPack/${props.id}`)}></Button>
          </Col>
        </Row>
        </BlockTitle>
        <List>
          {packsTags}
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="red" onClick={() => props.f7router.navigate(`/editProduct/${props.id}`)}>
        <Icon ios="f7:edit" aurora="f7:edit" md="material:edit"></Icon>
      </Fab>

      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default ProductDetails
