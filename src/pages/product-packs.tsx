import {useContext, useState, useEffect} from 'react'
import {f7, Page, Navbar, Card, CardContent, CardFooter, List, ListItem, Actions, ActionsButton, Fab, Icon, Badge} from 'framework7-react'
import RatingStars from './rating-stars'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import {archiveProduct, deleteProduct, showMessage, getMessage, showError, productOfText, getArchivedPacks} from '../data/actions'
import {Pack} from '../data/types'

type Props = {
  id: string,
  type: string
}
const ProductPacks = (props: Props) => {
  const {state, dispatch} = useContext(StateContext)
  const [error, setError] = useState('')
  const [product] = useState(() => state.products.find(p => p.id === props.id && (p.isActive || props.type === 'a'))!)
  const [packs, setPacks] = useState<Pack[]>([])
  const [activePacks, setActivePacks] = useState<Pack[]>([])
  const [actionOpened, setActionOpened] = useState(false);
  useEffect(() => {
    const getPacks = async () => {
      const packs = await getArchivedPacks(props.id)
      if (packs.length > 0) {
        dispatch({type: 'SET_ARCHIVED_PACKS', payload: packs})
      }
    }
    if (props.type === 'a') getPacks()
  }, [dispatch, props.id, props.type])
  useEffect(() => {
    setPacks(() => {
      const packs = state.packs.filter(p => p.product.id === props.id)
      return packs.sort((p1, p2) => p2.price! - p1.price!)
    })
  }, [state.packs, props.id])
  useEffect(() => {
    setActivePacks(() => packs.filter(p => p.isActive))
  }, [packs])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleArchive = () => {
    try{
      archiveProduct(product, state.packs)
      showMessage(labels.editSuccess)
      f7.views.current.router.back()
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  const handleDelete = () => {
    f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, () => {
      try{
        deleteProduct(product)
        showMessage(labels.deleteSuccess)
        f7.views.current.router.back()
      } catch(err) {
        setError(getMessage(f7.views.current.router.currentRoute.path, err))
      }
    })
  }

  return (
    <Page>
      <Navbar title={`${product.name}${product.alias ? '-' + product.alias : ''}`} backLink={labels.back} />
      <Card>
        <CardContent>
          <img src={product.imageUrl} className="img-card" alt={labels.noImage} />
        </CardContent>
        <CardFooter>
          <p>{productOfText(state.countries.find(c => c.id === product.countryId)!.name, state.trademarks.find(t => t.id === product.trademarkId)?.name)}</p>
          <p><RatingStars rating={product.rating} count={product.ratingCount} /></p> 
        </CardFooter>
      </Card>
      <List mediaList>
        {packs.map(p => 
          <ListItem 
            link={`/pack-details/${p.id}`}
            title={p.name}
            after={!p.price ? '' : p.price.toFixed(2)} 
            key={p.id} 
          >
            {!p.isActive && <Badge slot="title" color='red'>{labels.inActive}</Badge>}
          </ListItem>
        )}
      </List>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => setActionOpened(true)}>
        <Icon material="build"></Icon>
      </Fab>
      <Actions opened={actionOpened} onActionsClosed={() => setActionOpened(false)}>
        <ActionsButton onClick={() => f7.views.current.router.navigate(`/product-details/${props.id}`)}>
          {labels.details}
        </ActionsButton>
        <ActionsButton onClick={() => f7.views.current.router.navigate(`/add-pack/${props.id}/0`)}>
          {labels.addPack}
        </ActionsButton>
        <ActionsButton onClick={() => f7.views.current.router.navigate(`/add-group/${props.id}/0`)}>
          {labels.addGroup}
        </ActionsButton>
        {activePacks.length === 0 && 
          <ActionsButton onClick={() => handleArchive()}>
            {labels.archive}
          </ActionsButton>
        }
        {packs.length === 0 && 
          <ActionsButton onClick={() => handleDelete()}>
            {labels.delete}
          </ActionsButton>
        }
      </Actions>
    </Page>
  )
}

export default ProductPacks
