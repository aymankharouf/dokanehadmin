import React, { useContext, useState, useMemo, useEffect } from 'react'
import { Page, Navbar, Card, CardContent, CardFooter, List, ListItem, Icon, Fab, Toolbar, Badge, FabButton, FabButtons } from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import { StoreContext } from '../data/Store'
import { showMessage } from '../data/Actions'
import moment from 'moment'
import 'moment/locale/ar'

const PackDetails = props => {
  const { state, dispatch } = useContext(StoreContext)
  const [error, setError] = useState('')
  const today = (new Date()).setHours(0, 0, 0, 0)
  const pack = useMemo(() => state.packs.find(rec => rec.id === props.id)
  , [state.packs, props.id])
  const product = useMemo(() => state.products.find(rec => rec.id === pack.productId)
  , [state.products, pack])
  const packStores = useMemo(() => {
    let packStores = pack.stores
    packStores.sort((rec1, rec2) => rec1.price - rec2.price)
    packStores = packStores.map(packStore => {
      const currentStore = state.stores.find(rec => rec.id === packStore.id)
      return {...packStore, name: currentStore.name}
    })
    return packStores
  }, [pack, state.stores])
  useEffect(() => {
    if (error) {
      showMessage(props, 'error', error)
      setError('')
    }
  }, [error, props])
  const handlePurchase = store => {
		try{
      if (store.id === 's') return
      if (store.offerEnd && new Date() > store.offerEnd.toDate()) return
			if (state.basket.storeId && state.basket.storeId !== store.id){
				throw new Error(state.labels.twoDiffStores)
      }
      dispatch({type: 'ADD_TO_BASKET', params: {pack, store, quantity: 1, price: store.price}})
      showMessage(props, 'success', state.labels.addToBasketSuccess)
			props.f7router.back()
		} catch(err) {
			err.code ? setError(state.labels[err.code.replace(/-|\//g, '_')]) : setError(err.message)
		}
	}

  return (
    <Page>
      <Navbar title={`${product.name} ${pack.name}`} backLink={state.labels.back} />
      <Card>
        <CardContent>
          <img src={product.imageUrl} width="100%" height="250" alt=""/>
        </CardContent>
        <CardFooter>
          <p>{(pack.price / 1000).toFixed(3)}</p>
        </CardFooter>
      </Card>
      <List>
      {packStores.map(rec => 
        <ListItem 
          link="#"
          title={rec.name} 
          footer={moment(rec.time.toDate()).fromNow()} 
          after={(rec.price / 1000).toFixed(3)} 
          key={rec.id} 
          onClick={() => handlePurchase(rec)}
        >
          {rec.quantity ? <Badge slot="title" color='red'>{rec.quantity}</Badge> : ''}
          {rec.offerEnd && today > rec.offerEnd.toDate() ? <Badge slot="after" color='red'>{state.labels.endOffer}</Badge> : ''}
        </ListItem>
      )}
      </List>
      <Fab position="left-top" slot="fixed" color="orange">
        <Icon material="keyboard_arrow_down"></Icon>
        <Icon material="close"></Icon>
        <FabButtons position="bottom">
          <FabButton color="blue" onClick={() => props.f7router.navigate(`/editPack/${props.id}`)}>
            <Icon material="edit"></Icon>
          </FabButton>
          <FabButton color="green" onClick={() => props.f7router.navigate(`/packTrans/${props.id}`)}>
            <Icon material="import_export"></Icon>
          </FabButton>
        </FabButtons>
      </Fab>

      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default PackDetails
