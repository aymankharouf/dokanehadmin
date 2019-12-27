import React, { useContext, useMemo } from 'react'
import { Page, Navbar, Card, CardContent, CardFooter, List, ListItem, Badge, Toolbar, Popover, Link } from 'framework7-react'
import RatingStars from './RatingStars'
import { StoreContext } from '../data/Store';
import moment from 'moment'
import 'moment/locale/ar'

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
      <Navbar title={product.name} backLink={state.labels.back} />
      <Card>
        <CardContent>
          <img src={product.imageUrl} className="img-card" alt={product.name} />
        </CardContent>
        <CardFooter>
          <p>{`${state.labels.productOf} ${state.countries.find(c => c.id === product.countryId).name}`}</p>
          {product.trademarkId ? <p><RatingStars rating={product.rating} /></p> : ''}
        </CardFooter>
      </Card>
      <List mediaList>
        {packs.map(p => 
          <ListItem 
            link={`/packDetails/${p.id}`}
            title={p.name}
            subtitle={moment(p.time.toDate()).fromNow()}
            after={p.price ? (p.price / 1000).toFixed(3) : ''} 
            key={p.id} 
          >
            {p.isOffer ? 
              <Badge slot="title" color="green">
                {state.labels.offer}
              </Badge> 
            : ''}
          </ListItem>
        )}
      </List>
      <Popover className="popover-menu">
        <List>
          <ListItem 
            link={`/productDetails/${props.id}`}
            popoverClose 
            title={state.labels.details}
          />
          <ListItem 
            link={`/addPack/${props.id}`}
            popoverClose 
            title={state.labels.addPack}
          />
          <ListItem 
            link={`/addOffer/${props.id}`}
            popoverClose 
            title={state.labels.addOffer}
          />
          <ListItem 
            link={`/addBulk/${props.id}`}
            popoverClose 
            title={state.labels.addBulk}
          />
          <ListItem 
            link={`/relatedProducts/${props.id}`}
            popoverClose 
            title={state.labels.relatedProducts}
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