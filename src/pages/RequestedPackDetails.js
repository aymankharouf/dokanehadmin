import React, { useContext, useState, useMemo, useEffect } from 'react'
import { Block, Page, Navbar, Card, CardContent, List, ListItem, CardFooter, Toolbar, Badge } from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import { StoreContext } from '../data/Store';
import { packUnavailable, showMessage, showError, getMessage, addQuantity } from '../data/Actions'

const RequestedPackDetails = props => {
	const { state, dispatch } = useContext(StoreContext)
	const [error, setError] = useState('')
  const pack = useMemo(() => state.packs.find(p => p.id === props.packId)
  , [state.packs, props.packId])
  const product = useMemo(() => state.products.find(p => p.id === pack.productId)
  , [state.products, pack])
  const bonusProduct = useMemo(() => pack.bonusPackId ? state.products.find(p => p.id === state.packs.find(pa => pa.id === pack.bonusPackId).productId) : ''
  , [pack, state.products, state.packs])
  const basketStockQuantity = useMemo(() => {
    const basketStock = state.basket.storeId === 's' && state.basket.packs.find(p => p.packId === props.packId)
    return basketStock?.quantity ?? 0
  }, [state.basket, props.packId])
  const packStores = useMemo(() => {
    let packStores = state.storePacks.filter(p => (p.packId === props.packId || state.packs.find(pa => pa.id === p.packId && (pa.offerPackId === props.packId || pa.bonusPackId === props.packId))) && (p.storeId !== 's' || addQuantity(p.quantity, -1 * basketStockQuantity) > 0))
    packStores = packStores.map(s => {
      let packId, unitPrice, quantity, offerInfo, isOffer
      if (s.packId === props.packId) {
        packId = s.packId
        unitPrice = s.storeId === 's' || !s.quantity ? s.cost : parseInt(s.cost / s.quantity) 
        quantity = s.quantity
        isOffer = false
      } else {
        offerInfo = state.packs.find(p => p.id === s.packId && p.offerPackId === props.packId)
        if (offerInfo) {
          packId = offerInfo.id
          unitPrice = parseInt((s.cost / offerInfo.offerQuantity) * (offerInfo.offerPercent / 100))
          quantity = offerInfo.offerQuantity
          isOffer = true
        } else {
          offerInfo = state.packs.find(p => p.id === s.packId && p.bonusPackId === props.packId)
          if (offerInfo) {
            packId = offerInfo.id
            unitPrice = parseInt((s.cost / offerInfo.bonusQuantity) * (offerInfo.bonusPercent / 100))
            quantity = offerInfo.bonusQuantity
            isOffer = true
          }
        }
      }
      return {
        ...s,
        packId,
        quantity,
        unitPrice,
        isOffer
      }
    })
    packStores = packStores.filter(s => s.packId)
    const today = new Date()
    today.setDate(today.getDate() - 30)
    return packStores.sort((s1, s2) => 
    {
      if (s1.unitPrice === s2.unitPrice) {
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
        return s1.unitPrice - s2.unitPrice
      }
    })
  }, [props.packId, state.stores, state.storePacks, state.purchases, basketStockQuantity, state.packs])
  useEffect(() => {
    if (error) {
      showError(props, error)
      setError('')
    }
  }, [error, props])
	const handlePurchase = packStore => {
    try{
      if (state.basket.storeId && state.basket.storeId !== packStore.storeId){
        throw new Error('twoDiffStores')
      }
      const packInfo = state.packs.find(p => p.id === packStore.packId)
      if (packInfo.byWeight){
        if (state.basket.packs && state.basket.packs.find(p => p.packId === packInfo.id && p.orderId === props.orderId)) {
          throw new Error('alreadyInBasket')
        }
      } else {
        if (state.basket.packs && state.basket.packs.find(p => p.packId === packInfo.id)) {
          throw new Error('alreadyInBasket')
        }
      }
      if (!packStore.isOffer && packStore.price > Number(props.price)){
        throw new Error('priceHigherThanRequested')
      }
      let quantity, params
      if (packInfo.byWeight) {
        props.f7router.app.dialog.prompt(state.labels.enterWeight, state.labels.actualWeight, async weight => {
          try{
            if (packInfo.isDivided && parseInt(Math.abs(addQuantity(Number(props.quantity), -1 * Number(weight))) / Number(props.quantity) * 100) > state.labels.margin) {
              throw new Error('InvalidWeight')
            }
            if (packInfo.isDivided && packStore.storeId === 's' && packStore.quantity < Number(weight)) {
              throw new Error('InvalidWeight')
            }
            if (packStore.storeId === 's') {
              quantity = Math.min(Number(props.quantity), packStore.quantity)
            } else if (packStore.quantity) {
              quantity = Math.ceil(Number(props.quantity) / packStore.quantity)
            } else {
              quantity = Number(props.quantity)
            }  
            params = {
              pack: packInfo,
              packStore,
              quantity: pack.isDivided ? Number(weight) : quantity,
              price: Number(props.price),
              requestedQuantity: Number(props.quantity),
              orderId: props.orderId,
              weight: Number(weight),
              increment: packStore.isOffer || packStore.storeId === 's' || !packStore.quantity ? 1 : packStore.quantity
            }
            dispatch({type: 'ADD_TO_BASKET', params})
            showMessage(props, state.labels.addToBasketSuccess)
            props.f7router.back()
          } catch(err) {
            setError(getMessage(props, err))
          }      
        })
      } else {
        if (packStore.storeId === 's') {
          quantity = Math.min(Number(props.quantity), packStore.quantity)
        } else if (packStore.quantity) {
          quantity = Math.ceil(Number(props.quantity) / packStore.quantity)
        } else {
          quantity = Number(props.quantity)
        }
        params = {
          pack: packInfo,
          packStore,
          quantity,
          price: Number(props.price),
          requestedQuantity: Number(props.quantity),
          increment: packStore.isOffer || packStore.storeId === 's' || !packStore.quantity ? 1 : packStore.quantity
        }
        dispatch({type: 'ADD_TO_BASKET', params})
        showMessage(props, state.labels.addToBasketSuccess)
        props.f7router.back()  
      }
    } catch(err) {
      setError(getMessage(props, err))
    }
  }
  const handleUnavailable = overPriced => {
    props.f7router.app.dialog.confirm(state.labels.confirmationText, state.labels.confirmationTitle, async () => {
      try{
        const approvedOrders = state.orders.filter(o => o.status === 'a' || o.status === 'e')
        await packUnavailable(pack, Number(props.price), approvedOrders, state.customers, overPriced)
        showMessage(props, state.labels.executeSuccess)
        props.f7router.back()
      } catch(err) {
        setError(getMessage(props, err))
      }
    })
  }
  return (
    <Page>
      <Navbar title={product.name} backLink={state.labels.back} className="page-title" />
      <Block>
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
            <p>{(props.price / 1000).toFixed(3)}</p>
            <p>{props.quantity}</p>
          </CardFooter>
        </Card>
        <List mediaList>
          {packStores.length === 0 ? 
            <ListItem 
              link="#"
              title={state.labels.unavailable}
              onClick={() => handleUnavailable(false)}
            />
          : ''}
          {pack.price > Number(props.price) ? 
            <ListItem 
              link="#"
              title={state.labels.overPriced}
              onClick={() => handleUnavailable(true)}
            />
          : ''}
          {packStores.map(s => {
            const storeInfo = state.stores.find(st => st.id === s.storeId)
            const packInfo = state.packs.find(p => p.id === s.packId)
            const productInfo = state.products.find(p => p.id === packInfo.productId)
            return (
              <ListItem 
                link="#"
                title={storeInfo.name} 
                after={(s.unitPrice / 1000).toFixed(3)} 
                key={s.id}
                onClick={() => handlePurchase(s)}
              >
                <div className="list-line1">{`${productInfo.name} ${packInfo.name}`}</div>
                {addQuantity(s.quantity, -1 * basketStockQuantity) > 0 ? <Badge slot='title' color={s.isOffer ? 'red' : 'green'}>{addQuantity(s.quantity, -1 * basketStockQuantity)}</Badge> : ''}
              </ListItem>
            )
          })}
        </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default RequestedPackDetails
