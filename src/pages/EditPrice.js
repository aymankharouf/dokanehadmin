import React, {useState, useContext, useEffect, useMemo } from 'react'
import {Page, Navbar, List, ListInput, Card, CardContent, CardHeader, Fab, Icon} from 'framework7-react';
import { StoreContext } from '../data/Store';
import { editPrice, showMessage } from '../data/Actions'


const EditPrice = props => {
  const { state } = useContext(StoreContext)
  const pack = useMemo(() => state.packs.find(rec => rec.id === props.packId), [state.packs])
  const product = useMemo(() => state.products.find(rec => rec.id === pack.productId), [state.products])
  const store = useMemo(() => {
    const store = pack.stores.find(rec => rec.id === props.storeId)
    return {...store, name: state.stores.find(rec => rec.id === props.storeId).name}
  }, [pack])
  const [purchasePrice, setPurchasePrice] = useState((store.purchasePrice / 1000).toFixed(3))
  const [purchasePriceErrorMessage, setPurchasePriceErrorMessage] = useState('')
  const [price, setPrice] = useState((store.price / 1000).toFixed(3))
  const [priceErrorMessage, setPriceErrorMessage] = useState('')
  const initOfferEnd = store.offerEnd ? [store.offerEnd.toDate()] : ''
  const [offerEnd, setOfferEnd] = useState(initOfferEnd)
  const [offerEndErrorMessage, setOfferEndErrorMessage] = useState('')
  const hasChanged = useMemo(() => {
    if (price * 1000 !== store.price) {
      return true
    }
    if (purchasePrice * 1000 !== store.purchasePrice) {
      return true
    }
    if (!store.offerEnd && offerEnd.length > 0) {
      return true
    }
    if (store.offerEnd && offerEnd.length === 0){
      return true
    }
    if (store.offer && (store.offerEnd.toDate()).toString() === (new Date(offerEnd)).toString()) {
      return true
    }
    return false
  }, [price, purchasePrice, offerEnd])
  useEffect(() => {
    const setDefaultPrice = value => {
      if (store.type === '5') {
        setPrice((1 + (state.labels.profitPercent / 100) * value))
      } else {
        setPrice(value)
      }
    }
    const validatePrice = value => {
      if (value > 0 && (price ? price >= value : true)){
        setPurchasePriceErrorMessage('')
      } else {
        setPurchasePriceErrorMessage(state.labels.invalidPrice)
      }
    }
    if (purchasePrice && !price) setDefaultPrice(purchasePrice)
    if (purchasePrice) validatePrice(purchasePrice)
  }, [purchasePrice])
  useEffect(() => {
    const validatePrice = value => {
      if (value > 0 && (purchasePrice ? purchasePrice <= value : true)){
        setPriceErrorMessage('')
      } else {
        setPriceErrorMessage(state.labels.invalidPrice)
      }
    }
    if (price) validatePrice(price)
  }, [price])

  useEffect(() => {
    const validateDate = (value) => {
      if (new Date(value) > new Date()){
        setOfferEndErrorMessage('')
      } else {
        setOfferEndErrorMessage(state.labels.invalidOfferEnd)
      }
    }
    if (offerEnd.length > 0) validateDate(offerEnd)
    else setOfferEndErrorMessage('')
  }, [offerEnd])

  const handleEdit = () => {
    const offerEndDate = offerEnd.length > 0 ? new Date(offerEnd) : ''
    editPrice(
      store,
      pack,
      purchasePrice,
      price,
      offerEndDate 
    ).then(() => {
      showMessage(props, 'success', state.labels.editSuccess)
      props.f7router.back()
    })  
  }
  return (
    <Page>
      <Navbar title={`${state.labels.editPrice} - ${store.name}`} backLink={state.labels.back} />
      <Card>
        <CardHeader>
          <p>{product.name}</p>
          <p>{pack.name}</p>
        </CardHeader>
        <CardContent>
          <img src={product.imageUrl} width="100%" height="250" alt=""/>
        </CardContent>
      </Card>
      <List form>
        <ListInput 
          name="purchasePrice" 
          label={state.labels.purchasePrice}
          clearButton 
          floatingLabel 
          type="number" 
          value={purchasePrice}
          errorMessage={purchasePriceErrorMessage}
          errorMessageForce
          onChange={e => setPurchasePrice(e.target.value)}
          onInputClear={() => setPurchasePrice('')}
          readonly={store.id === 's'}
        />
        <ListInput 
          name="price" 
          label={state.labels.price}
          clearButton 
          floatingLabel 
          type="number" 
          value={price} 
          errorMessage={priceErrorMessage}
          errorMessageForce
          onChange={e => setPrice(e.target.value)}
          onInputClear={() => setPrice('')}
        />
        <ListInput
          name="offerEnd"
          label={state.labels.offerEnd}
          type="datepicker"
          clearButton
          value={offerEnd} 
          errorMessage={offerEndErrorMessage}
          errorMessageForce
          onCalendarChange={(value) => setOfferEnd(value)}
          onInputClear={() => setOfferEnd([])}
        />
      </List>
      {!purchasePrice || !price || priceErrorMessage || purchasePriceErrorMessage || offerEndErrorMessage || !hasChanged ? ''
      : <Fab position="left-top" slot="fixed" color="green" onClick={() => handleEdit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default EditPrice
