import React, { useState, useContext, useEffect, useMemo } from 'react'
import { addStorePack, showMessage } from '../data/Actions'
import {Page, Navbar, List, ListItem, ListInput, Block, Fab, Icon} from 'framework7-react';
import { StoreContext } from '../data/Store';


const AddStorePack = props => {
  const { state } = useContext(StoreContext)
  const store = useMemo(() => state.stores.find(rec => rec.id === props.id), [state.stores])
  const [productId, setProductId] = useState('')
  const [packId, setPackId] = useState('')
  const [productPacks, setProductPacks] = useState([])
  const [product, setProduct] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [purchasePriceErrorMessage, setPurchasePriceErrorMessage] = useState('')
  const [price, setPrice] = useState('')
  const [priceErrorMessage, setPriceErrorMessage] = useState('')
  const [offerEnd, setOfferEnd] = useState('')
  const [offerEndErrorMessage, setOfferEndErrorMessage] = useState('')
  const [error, setError] = useState('')
  useEffect(() => {
    if (purchasePrice) {
      const storeType = store ? store.type : ''
      if (storeType === '5') {
        setPrice(((1 + (state.labels.profitPercent / 100)) * purchasePrice).toFixed(3))
      } else {
        setPrice(purchasePrice)
      }
    } else {
      setPrice('')
    }
  }, [purchasePrice])
  useEffect(() => {
    if (productId) {
      setProduct(state.products.find(rec => rec.id === productId))
      setProductPacks(state.packs.filter(rec => rec.productId === productId))
    } else {
      setProduct('')
      setProductPacks([])
    }
  }, [productId])
  useEffect(() => {
    const validatePrice = () => {
      if (price > 0 && purchasePrice > 0 && price >= purchasePrice){
        setPriceErrorMessage('')
        setPurchasePriceErrorMessage('')
      } else {
        setPriceErrorMessage(state.labels.invalidPrice)
        setPurchasePriceErrorMessage(state.labels.invalidPrice)
      }
    }
    if (price || purchasePrice) {
      validatePrice()
    } else {
      setPriceErrorMessage('')
      setPurchasePriceErrorMessage('')
    }
  }, [price, purchasePrice])
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
  const handleSubmit = () => {
    const offerEndDate = offerEnd.length > 0 ? new Date(offerEnd) : ''
    addStorePack(
      state.packs.find(rec => rec.id === packId),
      store,
      purchasePrice,
      price,
      offerEndDate
    ).then(() => {
      showMessage(props, 'success', state.labels.addSuccess)
      props.f7router.back()
    })
  }

  const productsTags = useMemo(() => {
    const products = state.products
    products.sort((rec1, rec2) => rec1.name > rec2.name ? 1 : -1)
    return products.map(rec => 
      <option 
        key={rec.id} 
        value={rec.id}
      >
        {rec.name}
      </option>
    )
  }, [state.products])
  const packsTags = useMemo(() => productPacks.map(rec => 
    <option key={rec.id} value={rec.id}>
      {rec.name}
    </option>
  ), [productPacks])
  return (
    <Page>
      <Navbar title={`${state.labels.addProduct} - ${store.name}`} backLink={state.labels.back} />
      <List form>
        <ListItem
          title={state.labels.product}
          smartSelect
          smartSelectParams={{
            openIn: 'popup', 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: state.labels.search,
            popupCloseLinkText: state.labels.close
          }}
        >
          <select name="productId" defaultValue="" onChange={(e) => setProductId(e.target.value)}>
            <option value="" disabled></option>
            {productsTags}
          </select>
        </ListItem>
        <ListItem
          title={state.labels.pack}
          smartSelect
          smartSelectParams={{
            openIn: 'popup', 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: state.labels.search,
            popupCloseLinkText: state.labels.close
          }}
        >
          <select name="packId" defaultValue="" onChange={(e) => setPackId(e.target.value)}>
            <option value="" disabled></option>
            {packsTags}
          </select>
        </ListItem>
        <ListInput 
          name="puchasePrice" 
          label={state.labels.purchasePrice}
          value={purchasePrice}
          clearButton
          floatingLabel 
          type="number" 
          errorMessage={purchasePriceErrorMessage}
          errorMessageForce
          onChange={(e) => setPurchasePrice(e.target.value)}
          onInputClear={() => setPurchasePrice('')}
        />
        <ListInput 
          name="price" 
          label={state.labels.price}
          value={price}
          clearButton 
          floatingLabel 
          type="number" 
          errorMessage={priceErrorMessage}
          errorMessageForce
          onChange={(e) => setPrice(e.target.value)}
          onInputClear={() => setPrice('')}
        />
        <ListInput
          name="offerEnd"
          label={state.labels.offerEnd}
          type="datepicker"
          value={offerEnd} 
          clearButton
          errorMessage={offerEndErrorMessage}
          errorMessageForce
          onCalendarChange={(value) => setOfferEnd(value)}
          onInputClear={() => setOfferEnd([])}
        />
        <img src={product.imageUrl} alt=""/>
      </List>
      {!productId || !packId || !price || !purchasePrice || priceErrorMessage || purchasePriceErrorMessage || offerEndErrorMessage
      ? '' 
      : <Fab position="left-top" slot="fixed" color="green" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
      
    </Page>
  )
}
export default AddStorePack
