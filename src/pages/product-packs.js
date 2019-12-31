import React, { useContext, useMemo } from 'react'
import { Page, Navbar, Card, CardContent, CardFooter, List, ListItem, Badge, Toolbar, Popover, Link } from 'framework7-react'
import RatingStars from './rating-stars'
import { StoreContext } from '../data/store'
import moment from 'moment'
import 'moment/locale/ar'
import labels from '../data/labels'

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
          <p>{`${labels.productOf} ${state.countries.find(c => c.id === product.countryId).name}`}</p>
          {product.trademarkId ? <p><RatingStars rating={product.rating} /></p> : ''}
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
              <Badge slot="title" color="green">
                {labels.offer}
              </Badge> 
            : ''}
          </ListItem>
        )}
      </List>
      <Popover className="popover-menu">
        <List>
          <ListItem 
            link={`/product-details/${props.id}`}
            popoverClose 
            title={labels.details}
          />
          <ListItem 
            link={`/add-pack/${props.id}`}
            popoverClose 
            title={labels.addPack}
          />
          <ListItem 
            link={`/add-offer/${props.id}`}
            popoverClose 
            title={labels.addOffer}
          />
          <ListItem 
            link={`/add-bulk/${props.id}`}
            popoverClose 
            title={labels.addBulk}
          />
          <ListItem 
            link={`/related-products/${props.id}`}
            popoverClose 
            title={labels.relatedProducts}
          />

        </List>
      </Popover>

      <Toolbar bottom>
        <Link href="/home/" iconMaterial="home" />
        <Link popoverOpen=".popover-menu" iconMaterial="more_vert" />
      </Toolbar>
    </Page>
  )
}

export default ProductPacks
