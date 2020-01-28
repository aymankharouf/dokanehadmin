import React, { useContext, useState, useEffect } from 'react'
import { f7, Page, Navbar, Card, CardContent, CardFooter, List, ListItem, Badge, Toolbar, Actions, ActionsButton, Fab, Icon } from 'framework7-react'
import RatingStars from './rating-stars'
import { StoreContext } from '../data/store'
import moment from 'moment'
import 'moment/locale/ar'
import labels from '../data/labels'
import BottomToolbar from './bottom-toolbar'
import { archiveProduct, showMessage, getMessage, showError } from '../data/actions'

const ProductPacks = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] =useState(false)
  const [product] = useState(() => props.type === 'a' ? state.archivedProducts.find(p => p.id === props.id) : state.products.find(p => p.id === props.id))
  const [packs, setPacks] = useState([])
  const [activePacks, setActivePacks] = useState([])
  useEffect(() => {
    setPacks(() => {
      const packs = props.type === 'a' ? state.archivedPacks.filter(p => p.productId === props.id) : state.packs.filter(p => p.productId === props.id)
      return packs.sort((p1, p2) => p2.price - p1.price)
    })
  }, [state.packs, state.archivedPacks, props.id, props.type])
  useEffect(() => {
    setActivePacks(() => packs.filter(p => p.price > 0))
  }, [packs])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  useEffect(() => {
    if (inprocess) {
      f7.dialog.preloader(labels.inprocess)
    } else {
      f7.dialog.close()
    }
  }, [inprocess])
  const handleArchive = async () => {
    try{
      setInprocess(true)
      await archiveProduct(product, state.packs)
      setInprocess(false)
      showMessage(labels.editSuccess)
      props.f7router.back()
    } catch(err) {
      setInprocess(false)
			setError(getMessage(props, err))
		}
  }
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
        {activePacks.length === 0 ? 
          <ActionsButton onClick={() => handleArchive()}>{labels.archive}</ActionsButton>
        : ''}
      </Actions>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default ProductPacks
