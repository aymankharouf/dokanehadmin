import React, { useContext, useMemo } from 'react'
import { Page, Navbar, Card, CardContent, CardFooter, List, ListItem, Icon, Fab, Badge, BlockTitle, Row, Col, Button, Toolbar } from 'framework7-react'
import Rating from './Rating'
import { StoreContext } from '../data/Store';
import moment from 'moment'
import 'moment/locale/ar'
import BottomToolbar from './BottomToolbar'

const ProductDetails = props => {
  const { state } = useContext(StoreContext)
  const product = useMemo(() => state.products.find(p => p.id === props.id)
  , [state.products, props.id])
  const packs = useMemo(() => state.packs.filter(p => p.productId === props.id)
  , [state.packs, props.id]) 
  return (
    <Page>
      <Navbar title={product.name} backLink={state.labels.back} />
      <Card>
        <CardContent>
          <img src={product.imageUrl} width="100%" height="250" alt={product.name} />
        </CardContent>
        <CardFooter>
          <p>{`${state.labels.productOf} ${state.countries.find(c => c.id === product.country).name}`}</p>
          <p><Rating rating={product.rating} /></p>
        </CardFooter>
      </Card>
      <BlockTitle>
      <Row>
        <Col>
          {state.labels.packs}
        </Col>
        <Col>
          <Button small fill round iconMaterial="add" onClick={() => props.f7router.navigate(`/addPack/${props.id}`)} />
        </Col>
      </Row>
      </BlockTitle>
      <List>
        {packs.map(p => 
          <ListItem 
            title={p.name} 
            footer={moment(p.time.toDate()).fromNow()} 
            after={p.price ? (p.price / 1000).toFixed(3) : ''} 
            key={p.id} 
            link={`/packDetails/${p.id}`}
          >
            {p.isOffer ? <Badge slot="title" color='red'>{state.labels.offer}</Badge> : ''}
          </ListItem>
        )}
      </List>
      <Fab position="left-top" slot="fixed" color="red" onClick={() => props.f7router.navigate(`/editProduct/${props.id}`)}>
        <Icon material="edit"></Icon>
      </Fab>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default ProductDetails
