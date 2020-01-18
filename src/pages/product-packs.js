import React, { useContext, useMemo } from 'react'
import { f7, Page, Navbar, Card, CardContent, CardFooter, List, ListItem, Badge, Toolbar, Actions, ActionsButton, Fab, Icon } from 'framework7-react'
import RatingStars from './rating-stars'
import { StoreContext } from '../data/store'
import moment from 'moment'
import 'moment/locale/ar'
import labels from '../data/labels'
import BottomToolbar from './bottom-toolbar'

const ProductPacks = props => {
  const { state } = useContext(StoreContext)
  const product = useMemo(() => state.products.find(p => p.id === props.id)
  , [state.products, props.id])
  const packs = useMemo(() => {
    const packs = state.packs.filter(p => p.productId === props.id)
    return packs.sort((p1, p2) => p2.price - p1.price)
  }, [state.packs, props.id]) 
  return (
    <Page>
      <Navbar title={product.name} backLink={labels.back} />
      <Card>
        <CardContent>
          <img src={product.imageUrl} className="img-card" alt={product.name} />
        </CardContent>
        <CardFooter>
          <p>{`${labels.productOf} ${product.trademark ? labels.company + ' ' + product.trademark + '-' : ''}${product.country}`}</p>
          {product.trademark ? <p><RatingStars rating={product.rating} /></p> : ''}
        </CardFooter>
      </Card>
      <List mediaList>
        {packs.map(p => 
          <ListItem 
            link={`/pack-details/${p.id}`}
            title={p.name}
            subtitle={moment(p.time.toDate()).fromNow()}
            after={p.price ? (p.price / 1000).toFixed(3) : ''} 
            key={p.id} 
          >
            {p.isOffer ? 
              <Badge slot="title" color="green">{labels.offer}</Badge> 
            : ''}
          </ListItem>
        )}
      </List>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => f7.actions.open('#product-actions')}>
        <Icon material="build"></Icon>
      </Fab>
      <Actions id="product-actions">
        <ActionsButton onClick={() => props.f7router.navigate(`/product-details/${props.id}`)}>{labels.details}</ActionsButton>
        <ActionsButton onClick={() => props.f7router.navigate(`/add-pack/${props.id}`)}>{labels.addPack}</ActionsButton>
        <ActionsButton onClick={() => props.f7router.navigate(`/add-offer/${props.id}`)}>{labels.addOffer}</ActionsButton>
        <ActionsButton onClick={() => props.f7router.navigate(`/add-bulk/${props.id}`)}>{labels.addBulk}</ActionsButton>
        <ActionsButton onClick={() => props.f7router.navigate(`/related-products/${props.id}`)}>{labels.relatedProducts}</ActionsButton>
      </Actions>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default ProductPacks
