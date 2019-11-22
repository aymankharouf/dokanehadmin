import React, { useState, useContext, useEffect, useMemo } from 'react'
import {Page, Navbar, List, ListInput, Card, CardContent, CardHeader, Fab, Icon, FabButton, FabButtons } from 'framework7-react';
import { StoreContext } from '../data/Store';
import { editPrice, haltOffer, showMessage } from '../data/Actions'


const EditPrice = props => {
  const { state } = useContext(StoreContext)
  const pack = useMemo(() => state.packs.find(p => p.id === props.packId)
  , [state.packs, props.packId])
  const product = useMemo(() => state.products.find(p => p.id === pack.productId)
  , [state.products, pack])
  const store = useMemo(() => {
    const store = pack.stores.find(s => s.storeId === props.storeId)
    return {...store, name: state.stores.find(s => s.id === props.storeId).name}
  }, [pack, state.stores, props.storeId])
  const [purchasePrice, setPurchasePrice] = useState('')
  const [purchasePriceErrorMessage, setPurchasePriceErrorMessage] = useState('')
  const [price, setPrice] = useState('')
  const [priceErrorMessage, setPriceErrorMessage] = useState('')
  const initOfferEnd = store.offerEnd ? [store.offerEnd.toDate()] : ''
  const [offerEnd, setOfferEnd] = useState(initOfferEnd)
  const [offerEndErrorMessage, setOfferEndErrorMessage] = useState('')
  const [error, setError] = useState('')
  const hasChanged = useMemo(() => {
    if (price * 1000 !== store.price) return true
    if (purchasePrice * 1000 !== store.purchasePrice) return true
    if (!store.offerEnd && offerEnd.length > 0) return true
    if (store.offerEnd && offerEnd.length === 0) return true
    if (store.offer && (store.offerEnd.toDate()).toString() === (new Date(offerEnd)).toString()) return true
    return false
  }, [price, purchasePrice, offerEnd, store])
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
      showMessage(props, 'error', error)
      setError('')
    }
  }, [error, props])

  const handleEdit = () => {
    const offerEndDate = offerEnd.length > 0 ? new Date(offerEnd) : ''
    editPrice(pack, store, parseInt(purchasePrice * 1000), parseInt(price * 1000), offerEndDate).then(() => {
      showMessage(props, 'success', state.labels.editSuccess)
      props.f7router.back()
    })  
  }
  const handleHalt = () => {
    try{
      if (offerEnd.length === 0) {
        throw new Error(state.labels.noOffers)
      }
      const offerEndDate = new Date(offerEnd)
      const today = (new Date()).setHours(0, 0, 0, 0)
      let confirmation
      if (offerEndDate > today) {
        props.f7router.app.dialog.confirm(state.labels.confirmationText, () => {
          confirmation = true
        })
      } else {
        confirmation = true
      }
      if (!confirmation) return
      haltOffer(pack, store).then(() => {
        showMessage(props, 'success', state.labels.haltSuccess)
        props.f7router.back()
      })
    } catch (err) {
      err.code ? setError(state.labels[err.code.replace(/-|\//g, '_')]) : setError(err.message)
    }
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
          onCalendarChange={value => setOfferEnd(value)}
          onInputClear={() => setOfferEnd([])}
        />
      </List>
      <Fab position="left-top" slot="fixed" color="orange">
        <Icon material="keyboard_arrow_down"></Icon>
        <Icon material="close"></Icon>
        <FabButtons position="bottom">
          {!purchasePrice || !price || priceErrorMessage || purchasePriceErrorMessage || offerEndErrorMessage || !hasChanged ? ''
          :  <FabButton color="green" onClick={() => handleEdit()}>
              <Icon material="done"></Icon>
            </FabButton>
          }
          <FabButton color="red" onClick={() => handleHalt()}>
            <Icon material="report_problem"></Icon>
          </FabButton>
        </FabButtons>
      </Fab>
      
    </Page>
  )
}
export default EditPrice
