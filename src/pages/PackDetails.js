import React, { useContext, useState } from 'react'
import { Block, Page, Navbar, Card, CardContent, CardFooter, List, ListItem, Icon, Fab, Toolbar, Badge} from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import { StoreContext } from '../data/Store';
import moment from 'moment'
import 'moment/locale/ar'

const PackDetails = props => {
  const handlePurchase = store => {
		try{
      if (store.id === 's') return
			if (state.basket.store && state.basket.store.id !== store.id){
				throw new Error(state.labels.twoDiffStores)
      }
      dispatch({type: 'ADD_TO_BASKET', basket: {pack, store, quantity: 1, price: store.price}})
			props.f7router.back()
		} catch(err) {
			err.code ? setError(state.labels[err.code.replace(/-|\//g, '_')]) : setError(err.message)
		}
	}
  const { state, dispatch } = useContext(StoreContext)
  const [error, setError] = useState('')
  const pack = state.packs.find(rec => rec.id === props.id)
  const product = state.products.find(rec => rec.id === pack.productId)
  let packStores = pack.stores
  packStores = packStores.sort((packStore1, packStore2) => packStore1.price - packStore2.price)
  packStores = packStores.map(packStore => {
    const currentStore = state.stores.find(rec => rec.id === packStore.id)
    return {...packStore, name: currentStore.name}
  })
  const storesTags = packStores.map(store => 
    <ListItem 
      title={store.name} 
      footer={moment(store.time.toDate()).fromNow()} 
      after={(store.price / 1000).toFixed(3)} 
      key={store.id} 
      link="#"
      onClick={() => handlePurchase(store)}
    >
      {store.quantity ? <Badge slot="title" color='red'>{store.quantity}</Badge> : null}
    </ListItem>
  )
  return (
    <Page>
      <Navbar title={`${product.name} ${pack.name}`} backLink="Back" />
      <Fab position="left-top" slot="fixed" color="red" onClick={() => props.f7router.navigate(`/editPack/${props.id}`)}>
        <Icon ios="f7:edit" aurora="f7:edit" md="material:edit"></Icon>
      </Fab>
      <Block>
        <Card className="demo-card-header-pic">
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
      </Block>
      {error ? <Block strong className="error">{error}</Block> : null}
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default PackDetails
