import React, { useState, useContext, useEffect, useMemo } from 'react'
import { Page, Navbar, List, ListInput, Card, CardContent, CardHeader, Fab, Icon } from 'framework7-react';
import { StoreContext } from '../data/Store';
import { editPrice, showMessage, showError, getMessage } from '../data/Actions'


const EditPrice = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const storePack = useMemo(() => state.storePacks.find(p => p.id === props.id)
  , [state.storePacks, props.id])
  const pack = useMemo(() => state.packs.find(p => p.id === storePack.packId)
  , [state.packs, storePack])
  const product = useMemo(() => state.products.find(p => p.id === pack.productId)
  , [state.products, pack])
  const [purchasePrice, setPurchasePrice] = useState('')
  const [purchasePriceErrorMessage, setPurchasePriceErrorMessage] = useState('')
  const [price, setPrice] = useState('')
  const [priceErrorMessage, setPriceErrorMessage] = useState('')
  const initOfferEnd = storePack.offerEnd ? [storePack.offerEnd.toDate()] : ''
  const [offerEnd, setOfferEnd] = useState(initOfferEnd)
  const [offerEndErrorMessage, setOfferEndErrorMessage] = useState('')
  const hasChanged = useMemo(() => {
    if (price * 1000 !== storePack.price) return true
    if (purchasePrice * 1000 !== storePack.purchasePrice) return true
    if (!storePack.offerEnd && offerEnd.length > 0) return true
    if (storePack.offerEnd && offerEnd.length === 0) return true
    if (storePack.offerEnd && (storePack.offerEnd.toDate()).toString() === (new Date(offerEnd)).toString()) return true
    return false
  }, [price, purchasePrice, offerEnd, storePack])
  useEffect(() => {
    const validatePrice = value => {
      if (value > 0 && (price ? price >= value : true)){
        setPurchasePriceErrorMessage('')
      } else {
        setPurchasePriceErrorMessage(state.labels.invalidPrice)
      }
    }
    if (purchasePrice) validatePrice(purchasePrice)
  }, [purchasePrice, price, state.labels])
  useEffect(() => {
    const validatePrice = value => {
      if (value > 0 && (purchasePrice ? purchasePrice <= value : true)){
        setPriceErrorMessage('')
      } else {
        setPriceErrorMessage(state.labels.invalidPrice)
      }
    }
    if (price) validatePrice(price)
  }, [price, purchasePrice, state.labels])

  useEffect(() => {
    const validateDate = value => {
      if (new Date(value) > new Date()){
        setOfferEndErrorMessage('')
      } else {
        setOfferEndErrorMessage(state.labels.invalidOfferEnd)
      }
    }
    if (offerEnd.length > 0) validateDate(offerEnd)
    else setOfferEndErrorMessage('')
  }, [offerEnd, state.labels])
  useEffect(() => {
    if (error) {
      showError(props, error)
      setError('')
    }
  }, [error, props])

  const handleEdit = async () => {
    try{
      const offerEndDate = offerEnd.length > 0 ? new Date(offerEnd) : ''
      const newStorePack = {
        ...storePack,
        price: parseInt(price * 1000),
        purchasePrice: parseInt(purchasePrice * 1000),
        offerEnd: offerEndDate,
        time: new Date()
      }
      await editPrice(newStorePack, storePack.price, pack, state.storePacks)
      showMessage(props, state.labels.editSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(err, state.labels, props.f7route.route.component.name))
		}
  }
  return (
    <Page>
      <Navbar title={`${state.labels.editPrice} - ${state.stores.find(s => s.id === storePack.storeId).name}`} backLink={state.labels.back} />
      <Card>
        <CardHeader>
          <p>{product.name}</p>
          <p>{pack.name}</p>
        </CardHeader>
        <CardContent>
          <img src={product.imageUrl} className="img-card" alt={product.name} />
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
          readonly={storePack.storeId === 's'}
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
          onCalendarChange={value => setOfferEnd(value)}
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
