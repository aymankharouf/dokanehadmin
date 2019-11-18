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
  const pack = useMemo(() => state.packs.find(p => p.id === props.id)
  , [state.packs, props.id])
  const product = useMemo(() => state.products.find(p => p.id === pack.productId)
  , [state.products, pack])
  const packStores = useMemo(() => [...pack.stores].sort((s1, s2) => s1.price - s2.price)
  , [pack])
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
          <img src={product.imageUrl} width="100%" height="250" alt={product.name} />
        </CardContent>
        <CardFooter>
          <p>{(pack.price / 1000).toFixed(3)}</p>
        </CardFooter>
      </Card>
      <List>
      {packStores.map(s => {
        const currentStore = state.stores.find(st => st.id === s.id)
        return (
          <ListItem 
            link="#"
            title={currentStore.name} 
            footer={moment(s.time.toDate()).fromNow()} 
            after={(s.price / 1000).toFixed(3)} 
            key={s.id} 
            onClick={() => handlePurchase(s)}
          >
            {s.quantity ? <Badge slot="title" color='red'>{s.quantity}</Badge> : ''}
            {s.offerEnd && today > s.offerEnd.toDate() ? <Badge slot="after" color='red'>{state.labels.endOffer}</Badge> : ''}
          </ListItem>
        )
      })}
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
