import React, { useContext, useState, useMemo, useEffect } from 'react'
import { Page, Navbar, Card, CardContent, CardFooter, List, ListItem, Icon, Fab, Toolbar, Badge, FabButton, FabButtons } from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import { StoreContext } from '../data/Store'
import { showMessage, showError, getMessage } from '../data/Actions'
import moment from 'moment'
import 'moment/locale/ar'

const PackDetails = props => {
  const { state, dispatch } = useContext(StoreContext)
  const [error, setError] = useState('')
  const pack = useMemo(() => state.packs.find(p => p.id === props.id)
  , [state.packs, props.id])
  const product = useMemo(() => state.products.find(p => p.id === pack.productId)
  , [state.products, pack])
  const packStores = useMemo(() => {
    const packStores = state.storePacks.filter(p => p.packId === pack.id)
    return packStores.sort((s1, s2) => s1.price - s2.price)
  }, [pack, state.storePacks])
  useEffect(() => {
    if (error) {
      showError(props, error)
      setError('')
    }
  }, [error, props])
  const handlePurchase = packStore => {
		try{
      if (packStore.storeId === 's') {
        throw new Error('noPurchaseFromStore')
      }
      if (packStore.offerEnd && new Date() > packStore.offerEnd.toDate()) {
        throw new Error('offerEnded')
      }
			if (state.basket.storeId && state.basket.storeId !== packStore.storeId){
				throw new Error('twoDiffStores')
      }
      if (state.basket.packs && state.basket.packs.find(p => p.packId === packStore.packId)) {
        throw new Error('duplicatePacKInBasket')
      }
      dispatch({type: 'ADD_TO_BASKET', params: {pack, packStore, quantity: 1, price: packStore.price}})
      showMessage(props, state.labels.addToBasketSuccess)
			props.f7router.back()
    } catch(err) {
			setError(getMessage(err, state.labels, props.f7route.route.component.name))
		}
	}

  return (
    <Page>
      <Navbar title={`${product.name} ${pack.name}`} backLink={state.labels.back} />
      <Card>
        <CardContent>
          <img src={product.imageUrl} className="img-card" alt={product.name} />
        </CardContent>
        <CardFooter>
          <p>{(pack.price / 1000).toFixed(3)}</p>
        </CardFooter>
      </Card>
      <List>
      {packStores.map(s => {
        const storeInfo = state.stores.find(st => st.id === s.storeId)
        return (
          <ListItem 
            link="#"
            title={storeInfo.name} 
            footer={moment(s.time.toDate()).fromNow()} 
            after={(s.price / 1000).toFixed(3)} 
            key={s.storeId} 
            onClick={() => handlePurchase(s)}
          >
            {s.quantity ? <Badge slot="title" color='red'>{s.quantity}</Badge> : ''}
            {s.offerEnd ? <Badge slot="title" color='green'>{state.labels.offer}</Badge> : ''}
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
