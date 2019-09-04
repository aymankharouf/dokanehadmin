import React, { useState, useContext, useEffect } from 'react'
import { addProduct } from '../data/Actions'
import {Page, Navbar, List, ListItem, ListInput, Block, Fab, Icon} from 'framework7-react';
import { StoreContext } from '../data/Store';


const AddProduct = props => {
  const { state, products } = useContext(StoreContext)
  const nonStoreProducts = products.filter(rec => !rec.stores.find(store => store.id === props.id))
  const store = state.stores.find(rec => rec.id === props.id)
  const [productId, setProductId] = useState('')
  const [product, setProduct] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [price, setPrice] = useState('')
  const [offerEnd, setOfferEnd] = useState('')
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
      setProduct(products.find(rec => rec.id === productId))
    } else {
      setProduct('')
    }
  }, [productId])

  const handleSubmit = () => {
    try{
      if (productId === '') {
        throw new Error(state.labels.chooseProduct)
      }
      if (purchasePrice === '' || Number(purchasePrice) === 0) {
        throw new Error(state.labels.enterPurchasePrice)
      }
      if (price === '' || Number(price) === 0) {
        throw new Error(state.labels.enterPrice)
      }
      if (price * 1000 < purchasePrice * 1000) {
        throw new Error(state.labels.invalidPrice)
      }
      if (offerEnd.length > 0 && new Date(offerEnd) < new Date()) {
        throw new Error(state.labels.invalidOfferEnd)
      }
      const offerEndDate = offerEnd.length > 0 ? new Date(offerEnd) : ''
      addProduct(
        product,
        store,
        purchasePrice,
        price,
        offerEndDate
      ).then(() => {
        props.f7router.back()
      })
    } catch (err) {
      setError(err.message)
    }
  }
  const productsOptionsTags = nonStoreProducts.map(product => 
    <option 
      key={product.id} 
      value={product.id}
    >
      {`${product.name} ${product.description}`}
    </option>
  )
  return (
    <Page>
      <Navbar title={`${state.labels.addProduct} - ${store.name}`} backLink="Back" />
      {error ? <Block strong className="error">{error}</Block> : null}
      <List form>
        <ListItem
          title={state.labels.product}
          smartSelect
          smartSelectParams={{openIn: 'popup', closeOnSelect: true, searchbar: true, searchbarPlaceholder: 'Search product'}}
        >
          <select name="productId" defaultValue="" onChange={(e) => setProductId(e.target.value)}>
            <option value="" disabled></option>
            {productsOptionsTags}
          </select>
        </ListItem>
        <ListInput 
          name="puchasePrice" 
          label={state.labels.purchasePrice}
          value={purchasePrice}
          clearButton
          floatingLabel 
          type="number" 
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
          onChange={(e) => setPrice(e.target.value)}
          onInputClear={() => setPrice('')}
        />
        <ListInput
          name="offerEnd"
          label={state.labels.offerEnd}
          type="datepicker"
          value={offerEnd} 
          clearButton
          onCalendarChange={(value) => setOfferEnd(value)}
          onInputClear={() => setOfferEnd([])}
        />
        <img src={product.imageUrl} alt=""/>
      </List>
      <Fab position="center-bottom" slot="fixed" text={state.labels.submit} color="green" onClick={() => handleSubmit()}>
        <Icon ios="f7:check" aurora="f7:check" md="material:done"></Icon>
      </Fab>
    </Page>
  )
}
export default AddProduct
