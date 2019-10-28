import React, { useContext, useState, useMemo } from 'react'
import { Page, Navbar, Card, CardContent, CardFooter, List, ListItem, Icon, Fab, Toolbar, Badge} from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import { StoreContext } from '../data/Store';
import moment from 'moment'
import 'moment/locale/ar'

const PackDetails = props => {
  const { state, dispatch } = useContext(StoreContext)
  const [error, setError] = useState('')
  const pack = useMemo(() => state.packs.find(rec => rec.id === props.id), [state.packs])
  const product = useMemo(() => state.products.find(rec => rec.id === pack.productId), [state.products])
  const storesTags = useMemo(() => {
    const today = (new Date()).setHours(0, 0, 0, 0)
    let packStores = pack.stores
    packStores.sort((rec1, rec2) => rec1.price - rec2.price)
    packStores = packStores.map(packStore => {
      const currentStore = state.stores.find(rec => rec.id === packStore.id)
      return {...packStore, name: currentStore.name}
    })
    return packStores.map(rec => 
      <ListItem 
        title={rec.name} 
        footer={moment(rec.time.toDate()).fromNow()} 
        after={(rec.price / 1000).toFixed(3)} 
        key={rec.id} 
        link="#"
        onClick={() => handlePurchase(rec)}
      >
        {rec.quantity ? <Badge slot="title" color='red'>{rec.quantity}</Badge> : ''}
        {rec.offerEnd && today > rec.offerEnd.toDate() ? <Badge slot="after" color='red'>{state.labels.endOffer}</Badge> : ''}
      </ListItem>
    )
  }, [pack, state.stores]) 
  const handlePurchase = store => {
		try{
      if (store.id === 's') return
      if (store.offerEnd && new Date() > store.offerEnd.toDate()) return
			if (state.basket.store && state.basket.store.id !== store.id){
				throw new Error(state.labels.twoDiffStores)
      }
      dispatch({type: 'ADD_TO_BASKET', basket: {pack, store, quantity: 1, price: store.price}})
			props.f7router.back()
		} catch(err) {
			err.code ? setError(state.labels[err.code.replace(/-|\//g, '_')]) : setError(err.message)
		}
	}
  return (
    <Page>
      <Navbar title={`${product.name} ${pack.name}`} backLink={state.labels.back} />
      <Fab position="left-top" slot="fixed" color="red" onClick={() => props.f7router.navigate(`/editPack/${props.id}`)}>
        <Icon ios="f7:edit" aurora="f7:edit" md="material:edit"></Icon>
      </Fab>
      <Card>
        <CardContent>
          <img src={product.imageUrl} width="100%" height="250" alt=""/>
        </CardContent>
        <CardFooter>
          <p>{(pack.price / 1000).toFixed(3)}</p>
          <p>{pack.isActive === false ? state.labels.inActive : ''}</p>
        </CardFooter>
      </Card>
      <List>
        {storesTags}
      </List>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default PackDetails
