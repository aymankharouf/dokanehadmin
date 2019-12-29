import React, { useContext, useState, useMemo, useEffect } from 'react'
import { f7, Block, Page, Navbar, Card, CardContent, List, ListItem, CardFooter, Toolbar, Button } from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import { StoreContext } from '../data/store'
import { packUnavailable, showMessage, showError, getMessage, addQuantity } from '../data/actions'
import PackImage from './PackImage'
import labels from '../data/labels'

const RequestedPackDetails = props => {
	const { state, dispatch } = useContext(StoreContext)
	const [error, setError] = useState('')
  const pack = useMemo(() => state.packs.find(p => p.id === props.packId)
  , [state.packs, props.packId])
  const product = useMemo(() => state.products.find(p => p.id === pack.productId)
  , [state.products, pack])
  const basketStockQuantity = useMemo(() => {
    const basketStock = state.basket.storeId === 's' && state.basket.packs.find(p => p.packId === props.packId)
    return basketStock?.quantity || 0
  }, [state.basket, props.packId])
  const packStores = useMemo(() => {
    let packStores = state.storePacks.filter(p => (p.packId === props.packId || state.packs.find(pa => pa.id === p.packId && (pa.subPackId === props.packId || pa.bonusPackId === props.packId))) && (p.storeId !== 's' || addQuantity(p.quantity, -1 * basketStockQuantity) > 0))
    packStores = packStores.map(s => {
      let packId, unitPrice, quantity, offerInfo, isOffer, price
      if (s.packId === props.packId) {
        packId = s.packId
        if (s.cost === s.price || s.storeId === 's') { // for type 5 get total price not unit price
          price = s.price
          unitPrice = s.price
        } else {
          price = s.cost
          unitPrice = s.price
        }
        quantity = s.quantity
        isOffer = false
      } else {
        offerInfo = state.packs.find(p => p.id === s.packId && p.subPackId === props.packId)
        if (offerInfo) {
          packId = offerInfo.id
          if (s.cost === s.price || s.storeId === 's') { // for type 5 get total price not unit price
            unitPrice = parseInt((s.price / offerInfo.subQuantity) * (offerInfo.subPercent / 100))
            price = s.price
            isOffer = true
          } else {
            unitPrice = s.price
            price = s.cost
            isOffer = false
          }
          quantity = offerInfo.subQuantity
        } else {
          offerInfo = state.packs.find(p => p.id === s.packId && p.bonusPackId === props.packId)
          if (offerInfo) {
            packId = offerInfo.id
            price = s.price
            unitPrice = parseInt((s.price / offerInfo.bonusQuantity) * (offerInfo.bonusPercent / 100))
            quantity = offerInfo.bonusQuantity
            isOffer = true
          }
        }
      }
      return {
        ...s,
        packId,
        price,
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
      showError(error)
      setError('')
    }
  }, [error])
  const addToBasket = (packStore, requested, exceedPriceType) => {
    try {
      const packInfo = state.packs.find(p => p.id === packStore.packId)
      let quantity, params
      if (packInfo.byWeight) {
        f7.dialog.prompt(labels.enterWeight, labels.actualWeight, weight => {
          try{
            if (packInfo.isDivided && parseInt(Math.abs(addQuantity(Number(props.quantity), -1 * Number(weight))) / Number(props.quantity) * 100) > labels.margin) {
              throw new Error('InvalidWeight')
            }
            if (packInfo.isDivided && packStore.storeId === 's' && packStore.quantity < Number(weight)) {
              throw new Error('InvalidWeight')
            }
            if (packStore.storeId === 's') {
              quantity = Math.min(Number(requested), packStore.quantity)
            } else if (packStore.quantity) {
              quantity = Math.ceil(Number(requested) / packStore.quantity)
            } else {
              quantity = Number(requested)
            }  
            params = {
              pack: packInfo,
              packStore,
              quantity: pack.isDivided ? Number(weight) : quantity,
              price: Number(props.price),
              requested,
              orderId: props.orderId,
              weight: Number(weight),
              exceedPriceType
            }
            dispatch({type: 'ADD_TO_BASKET', params})
            showMessage(labels.addToBasketSuccess)
            props.f7router.back()
          } catch(err) {
            setError(getMessage(props, err))
          }      
        })
      } else {
        if (packStore.storeId === 's') {
          quantity = Math.min(Number(requested), packStore.quantity)
        } else if (packStore.quantity) {
          quantity = Math.ceil(Number(requested) / packStore.quantity)
        } else {
          quantity = Number(requested)
        }
        params = {
          pack: packInfo,
          packStore,
          quantity,
          price: Number(props.price),
          requested,
          exceedPriceType
        }
        dispatch({type: 'ADD_TO_BASKET', params})
        showMessage(labels.addToBasketSuccess)
        props.f7router.back()  
      }
    } catch(err) {
      setError(getMessage(props, err))
    }
  }
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
      if (packStore.unitPrice > Number(props.price)){
        if (Number(props.price) < pack.price) { 
          if (packStore.unitPrice === pack.price && parseInt(Number(props.price) * (100 + labels.exceedPricePercent) / 100) >= packStore.price && Number(props.exceedPriceQuantity) > 0) {
            f7.dialog.confirm(labels.exceedPricePurchase, labels.confirmationTitle, () => addToBasket(packStore, Number(props.exceedPriceQuantity), 'p'))
          } else {
            throw new Error('noPurchase')
          }
        } else {
          f7.dialog.confirm(labels.priceHigherThanRequested, labels.confirmationTitle, () => addToBasket(packStore, Number(props.quantity), 'o'))
        }
      } else {
        addToBasket(packStore, Number(props.quantity), 'n')
      }
    } catch(err) {
      setError(getMessage(props, err))
    }
  }
  const handleUnavailable = overPriced => {
    f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, async () => {
      try{
        const approvedOrders = state.orders.filter(o => o.status === 'a' || o.status === 'e')
        await packUnavailable(pack, Number(props.price), approvedOrders, overPriced)
        showMessage(labels.executeSuccess)
        props.f7router.back()
      } catch(err) {
        setError(getMessage(props, err))
      }
    })
  }
  return (
    <Page>
      <Navbar title={product.name} backLink={labels.back} />
      <Block>
        <Card>
          <CardContent>
            <div className="card-title">{pack.name}</div>
            <PackImage pack={pack} type="card" />
          </CardContent>
          <CardFooter>
            <p>{`${labels.orderPrice}: ${(props.price / 1000).toFixed(3)}`}<br />
            {`${labels.currentPrice}: ${(pack.price / 1000).toFixed(3)}`}<br />
            {`${labels.quantity}: ${props.quantity}`}</p>
          </CardFooter>
        </Card>
        <List mediaList>
          {packStores.length === 0 ? 
            <ListItem 
              link="#"
              title={labels.unavailable}
              onClick={() => handleUnavailable(false)}
            />
          : ''}
          {pack.price > Number(props.price) ? 
            <ListItem 
              link="#"
              title={labels.overPriced}
              onClick={() => handleUnavailable(true)}
            />
          : ''}
          {packStores.map(s => {
            const storeInfo = state.stores.find(st => st.id === s.storeId)
            const packInfo = state.packs.find(p => p.id === s.packId)
            const productInfo = state.products.find(p => p.id === packInfo.productId)
            return (
              <ListItem 
                title={storeInfo.name}
                subtitle={`${productInfo.name} ${packInfo.name}`}
                text={`${labels.unitPrice}: ${(s.unitPrice / 1000).toFixed(3)}`}
                footer={addQuantity(s.quantity, -1 * basketStockQuantity) > 0 ? `${labels.quantity}: ${addQuantity(s.quantity, -1 * basketStockQuantity)}` : ''}
                key={s.id}
              >
                <Button slot="after" onClick={() => handlePurchase(s)}>{labels.purchase}</Button>
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
