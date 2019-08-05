import React, { useState, useContext, useEffect } from 'react'
import { addProduct } from '../data/Actions'
import {Page, Navbar, List, ListItem, ListInput, Button, Block} from 'framework7-react';
import { StoreContext } from '../data/Store';


const AddProduct = props => {
  const { state, products } = useContext(StoreContext)
  const nonStoreProducts = products.filter(rec => rec.stores.findIndex(store => store.id === props.id) === -1)
  const store = state.stores.find(rec => rec.id === props.id)
  const [productId, setProductId] = useState('')
  const [product, setProduct] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [price, setPrice] = useState('')
  const [offerEnd, setOfferEnd] = useState('')
  const [error, setError] = useState('')
  useEffect(() => {
    const storeType = store ? store.storeType : null
    if (storeType === 'w') {
      const currentCategory = state.categories.find(rec => rec.id === product.category)
      const currentSection = currentCategory ? state.sections.find(rec => rec.id === currentCategory.section) : null
      const percent = currentSection ? currentSection.percent : 0
      setPrice(((1 + (percent / 100)) * purchasePrice))
    } else {
      setPrice(purchasePrice)
    }
  }, [purchasePrice])

  const handleSubmit = () => {
    try{
      if (productId === '') {
        throw 'enter product'
      }
      if (purchasePrice === '') {
        throw 'enter product purchase price'
      }
      if (price === '') {
        throw 'enter product price'
      }
      if (price < purchasePrice) {
        throw 'enter a valid price'
      }
      if (offerEnd.length > 0 && new Date(offerEnd) < new Date()) {
        throw 'enter a valid offer end date'
      }
      const offerEndDate = offerEnd.length > 0 ? new Date(offerEnd) : ''
      addProduct(
        product,
        store,
        parseFloat(purchasePrice).toFixed(3),
        parseFloat(price).toFixed(3),
        offerEndDate
      ).then(() => {
        props.f7router.back()
      })
    } catch (err) {
      setError(err)
    }
  }
  const handleProductChange = e => {
    setProductId(e.target.value)
    setProduct(products.find(rec => rec.id === e.target.value))
  }
  const productsOptionsTags = nonStoreProducts.map(product => <option key={product.id} value={product.id}>{product.name}</option>)
  return (
    <Page>
      <Navbar title={`Add to ${store.name}`} backLink="Back" />
      <List form>
        <ListItem
          title="Product"
          smartSelect
          smartSelectParams={{openIn: 'popup', closeOnSelect: true, searchbar: true, searchbarPlaceholder: 'Search product'}}
        >
          <select name="productId" defaultValue="" onChange={(e) => handleProductChange(e)}>
            <option value="" disabled></option>
            {productsOptionsTags}
          </select>
        </ListItem>
        <ListInput 
          name="puchasePrice" 
          label="Puchase Price" 
          value={purchasePrice}
          clearButton
          floatingLabel 
          type="number" 
          onChange={(e) => setPurchasePrice(e.target.value)}
          onInputClear={() => setPurchasePrice('')}
        />
        <ListInput 
          name="price" 
          label="Price" 
          value={price}
          clearButton 
          floatingLabel 
          type="number" 
          onChange={(e) => setPrice(e.target.value)}
          onInputClear={() => setPrice('')}
        />
        <ListInput
          name="offerEnd"
          label="Offer End At"
          type="datepicker"
          value={offerEnd} 
          clearButton
          onCalendarChange={(value) => setOfferEnd(value)}
          onInputClear={() => setOfferEnd([])}
        />
        <img src={product.imageUrl} alt=""/>
        <Button fill onClick={() => handleSubmit()}>Submit</Button>
        <Button href={`/newProduct/${props.id}`}>New</Button>
      </List>
      <Block strong className="error">
        <p>{error}</p>
      </Block>
    </Page>
  )
}
export default AddProduct
