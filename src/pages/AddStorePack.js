import React, { useState, useContext, useEffect } from 'react'
import { addStorePack, showMessage } from '../data/Actions'
import {Page, Navbar, List, ListItem, ListInput, Block, Fab, Icon} from 'framework7-react';
import { StoreContext } from '../data/Store';


const AddStorePack = props => {
  const { state } = useContext(StoreContext)
  const store = state.stores.find(rec => rec.id === props.id)
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
    if (product && purchasePrice) {
      const storeType = store ? store.type : null
      if (storeType === 'w') {
        const category = state.categories.find(rec => rec.id === product.category)
        const section = category ? state.sections.find(rec => rec.id === category.sectionId) : null
        const percent = section ? section.percent : 0
        setPrice(((1 + (percent / 100)) * purchasePrice).toFixed(3))
      } else {
        setPrice(purchasePrice)
      }
    } else {
      setPrice('')
    }
  }, [product, purchasePrice])
  useEffect(() => {
    if (productId) {
      setProduct(state.products.find(rec => rec.id === productId))
      setProductPacks(state.packs.filter(rec => rec.productId === productId && rec.isActive === true))
    } else {
      setProduct('')
      setProductPacks([])
    }
  }, [productId])
  useEffect(() => {
    const validatePrice = () => {
      if (price * 1000 >= purchasePrice * 1000){
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
      if (new Date(value) >= new Date()){
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
  let products = state.products.filter(rec => rec.isActive === true)
  products.sort((product1, product2) => product1.name > product2.name ? 1 : -1)
  const productsOptionsTags = products.map(product => 
    <option 
      key={product.id} 
      value={product.id}
    >
      {product.name}
    </option>
  )
  const packsOptionsTags = productPacks.map(pack => 
    <option 
      key={pack.id} 
      value={pack.id}
    >
      {pack.name}
    </option>
  )
  return (
    <Page>
      <Navbar title={`${state.labels.addProduct} - ${store.name}`} backLink="Back" />
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
            {productsOptionsTags}
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
            {packsOptionsTags}
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
      : <Fab position="left-bottom" slot="fixed" color="green" onClick={() => handleSubmit()}>
          <Icon ios="f7:check" aurora="f7:check" md="material:done"></Icon>
        </Fab>
      }
      
    </Page>
  )
}
export default AddStorePack
