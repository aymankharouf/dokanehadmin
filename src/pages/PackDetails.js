import React, { useContext, useState, useMemo, useEffect } from 'react'
import { Page, Navbar, Card, CardContent, CardFooter, List, ListItem, Icon, Fab, Toolbar, Badge, FabButton, FabButtons, Button } from 'framework7-react'
import { StoreContext } from '../data/Store'
import { refreshPackPrice, showMessage, showError, getMessage } from '../data/Actions'
import BottomToolbar from './BottomToolbar';

const PackDetails = props => {
  const { state, dispatch } = useContext(StoreContext)
  const [error, setError] = useState('')
  const pack = useMemo(() => state.packs.find(p => p.id === props.id)
  , [state.packs, props.id])
  const product = useMemo(() => state.products.find(p => p.id === pack.productId)
  , [state.products, pack])
  const bonusProduct = useMemo(() => pack.bonusPackId ? state.products.find(p => p.id === state.packs.find(pa => pa.id === pack.bonusPackId).productId) : ''
  , [pack, state.products, state.packs])
  const packStores = useMemo(() => {
    let packStores = state.storePacks.filter(p => (p.packId === pack.id || state.packs.find(pa => pa.id === p.packId && (pa.offerPackId === pack.id || pa.bonusPackId === pack.id))))
    packStores = packStores.map(s => {
      let packId, unitCost, quantity, offerInfo, isOffer
      if (s.packId === pack.id) {
        packId = s.packId
        unitCost = s.storeId === 's' || !s.quantity ? s.cost : parseInt(s.cost / s.quantity) 
        quantity = s.quantity
        isOffer = false
      } else {
        offerInfo = state.packs.find(p => p.id === s.packId && p.offerPackId === pack.id)
        if (offerInfo) {
          packId = offerInfo.id
          unitCost = parseInt((s.cost / offerInfo.offerQuantity) * (offerInfo.offerPercent / 100))
          quantity = offerInfo.offerQuantity
          isOffer = true
        } else {
          offerInfo = state.packs.find(p => p.id === s.packId && p.bonusPackId === pack.id)
          if (offerInfo) {
            packId = offerInfo.id
            unitCost = parseInt((s.cost / offerInfo.bonusQuantity) * (offerInfo.bonusPercent / 100))
            quantity = offerInfo.bonusQuantity
            isOffer = true
          }
        }
      }
      return {
        ...s,
        packId,
        quantity,
        unitCost,
        isOffer
      }
    })
    packStores = packStores.filter(s => s.packId)
    const today = new Date()
    today.setDate(today.getDate() - 30)
    return packStores.sort((s1, s2) => 
    {
      if (s1.unitCost === s2.unitCost) {
        const store1 = state.stores.find(s => s.id === s1.storeId)
        const store2 = state.stores.find(s => s.id === s2.storeId)
        if (store1.type === store2.type){
          if (store2.discount === store1.discount) {
            const store1Purchases = state.purchases.filter(p => p.storeId === s1.storeId && p.time.toDate() < today)
            const store2Purchases = state.purchases.filter(p => p.storeId === s2.storeId && p.time.toDate() < today)
            const store1Sales = store1Purchases.reduce((sum, p) => sum + p.total, 0)
            const store2Sales = store2Purchases.reduce((sum, p) => sum + p.total, 0)
            return store1Sales - store2Sales
          } else {
            return Number(store2.discount) - Number(store1.discount)
          }
        } else {
          return Number(store1.type) - Number(store2.type)
        }
      } else {
        return s1.unitCost - s2.unitCost
      }
    })
  }, [pack, state.stores, state.storePacks, state.purchases, state.packs])
  useEffect(() => {
    if (error) {
      showError(props, error)
      setError('')
    }
  }, [error, props])
  const handlePurchase = packStore => {
		try{
      if (packStore.offerEnd && new Date() > packStore.offerEnd.toDate()) {
        throw new Error('offerEnded')
      }
			if (state.basket.storeId && state.basket.storeId !== packStore.storeId){
				throw new Error('twoDiffStores')
      }
      if (state.basket.packs && state.basket.packs.find(p => p.packId === packStore.packId)) {
        throw new Error('duplicatePacKInBasket')
      }
      const packInfo = state.packs.find(p => p.id === packStore.packId)
      let params
      if (packInfo.byWeight) {
        props.f7router.app.dialog.prompt(state.labels.enterWeight, state.labels.actualWeight, async weight => {
          params = {
            pack: packInfo,
            packStore,
            quantity : packInfo.isDivided ? Number(weight) : (packStore.isOffer || !packStore.quantity ? 1 : packStore.quantity),
            price: packStore.price,
            orderId: props.orderId,
            weight: Number(weight),
            increment: packStore.isOffer || !packStore.quantity ? 1 : packStore.quantity
          }
          dispatch({type: 'ADD_TO_BASKET', params})
          showMessage(props, state.labels.addToBasketSuccess)
          props.f7router.back()
        })
      } else {
        params = {
          pack: packInfo, 
          packStore,
          quantity: packStore.isOffer || !packStore.quantity ? 1 : packStore.quantity,
          price: packStore.price,
          orderId: props.orderId,
          increment: packStore.isOffer || !packStore.quantity ? 1 : packStore.quantity,
        }
        dispatch({type: 'ADD_TO_BASKET', params})
        showMessage(props, state.labels.addToBasketSuccess)
        props.f7router.back()
      }
    } catch(err) {
			setError(getMessage(props, err))
		}
	}
  const handleRefreshPrice = async () => {
    try{
      await refreshPackPrice(pack, state.storePacks)
      showMessage(props, state.labels.refreshSuccess)
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  return (
    <Page>
      <Navbar title={product.name} backLink={state.labels.back} className="page-title" />
      <Card>
        <CardContent>
          <div className="card-title">{pack.name}</div>
            <div className="relative">
              <img src={product.imageUrl} className="img-card" alt={product.name} />
              {pack.offerQuantity > 1 ? <span className="offer-quantity-card">{`× ${pack.offerQuantity}`}</span> : ''}
              {pack.bonusPackId ? 
                <div>
                  <img src={bonusProduct.imageUrl} className="bonus-img-card" alt={bonusProduct.name} />
                  {pack.bonusQuantity > 1 ? <span className="bonus-quantity-card">{`× ${pack.bonusQuantity}`}</span> : ''}
                </div>
              : ''}
            </div>
        </CardContent>
        <CardFooter>
          <p>{(pack.price / 1000).toFixed(3)}</p>
        </CardFooter>
      </Card>
      <List mediaList>
      {packStores.map(s => {
        const storeInfo = state.stores.find(st => st.id === s.storeId)
        return (
          <ListItem 
            title={storeInfo.name} 
            key={s.id}
            className= "list-title"
          >
            <div className="list-line1">{`${state.labels.unitCost}: ${(s.unitCost / 1000).toFixed(3)}, ${state.labels.price}: ${(s.price / 1000).toFixed(3)}`}</div>
            {s.quantity ? 
              <Badge slot="title" color='red'>{s.quantity}</Badge> 
            : ''}
            {s.isOffer || s.offerEnd ? 
              <Badge slot="title" color='green'>{state.labels.offer}</Badge> 
            : ''}
            {s.storeId === 's' ? '' :
              <Button slot="after" onClick={() => handlePurchase(s)}>{state.labels.purchase}</Button>
            }
          </ListItem>
        )
      })}
      </List>
      <Fab position="left-top" slot="fixed" color="orange">
        <Icon material="keyboard_arrow_down"></Icon>
        <Icon material="close"></Icon>
        <FabButtons position="bottom">
          <FabButton color="green" onClick={() => props.f7router.navigate(`/addPackStore/${props.id}`)}>
            <Icon material="add"></Icon>
          </FabButton>
          <FabButton color="blue" onClick={() => props.f7router.navigate(`/${pack.isOffer ? 'editOffer' : 'editPack'}/${props.id}`)}>
            <Icon material="edit"></Icon>
          </FabButton>
          <FabButton color="yellow" onClick={() => handleRefreshPrice()}>
            <Icon material="cached"></Icon>
          </FabButton>
          <FabButton color="red" onClick={() => props.f7router.navigate(`/packTrans/${props.id}`)}>
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
