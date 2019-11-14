import React, { useState, useContext, useEffect, useMemo } from 'react'
import { addStorePack, showMessage } from '../data/Actions'
import { Page, Navbar, List, ListItem, ListInput, Fab, Icon } from 'framework7-react';
import { StoreContext } from '../data/Store';


const AddStorePack = props => {
  const { state } = useContext(StoreContext)
  const store = useMemo(() => state.stores.find(rec => rec.id === props.id)
  , [state.stores, props.id])
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
    if (productId) {
      setProduct(state.products.find(rec => rec.id === productId))
      setProductPacks(state.packs.filter(rec => rec.productId === productId))
    } else {
      setProduct('')
      setProductPacks([])
    }
  }, [state.packs, state.products, productId])
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
  }, [offerEnd, state.labels])
  const handleSubmit = () => {
    const offerEndDate = offerEnd.length > 0 ? new Date(offerEnd) : ''
    addStorePack(
      state.packs.find(rec => rec.id === packId),
      store,
      parseInt(purchasePrice * 1000),
      parseInt(price * 1000),
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
      <option key={rec.id} value={rec.id}>{rec.name}</option>
    )
  }, [state.products])
  const packsTags = useMemo(() => productPacks.map(rec => 
    <option key={rec.id} value={rec.id}>{rec.name}</option>
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
            <option value=""></option>
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
            <option value=""></option>
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
          onChange={e => setPurchasePrice(e.target.value)}
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
          onChange={e => setPrice(e.target.value)}
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
          onCalendarChange={value => setOfferEnd(value)}
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
