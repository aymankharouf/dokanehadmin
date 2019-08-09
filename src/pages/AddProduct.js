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
      const storeType = store ? store.storeType : null
      if (storeType === 'w') {
        const category = state.categories.find(rec => rec.id === product.category)
        const section = category ? state.sections.find(rec => rec.id === category.sectionId) : null
        const percent = section ? section.percent : 0
        setPrice(parseFloat((1 + (percent / 100)) * purchasePrice).toFixed(3))
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
  const productsOptionsTags = nonStoreProducts.map(product => 
    <option 
      key={product.id} 
      value={product.id}
    >
      {`${product.name} ${product.size} ${state.units.find(rec => rec.id === product.unit).name}`}
    </option>
  )
  return (
    <Page>
      <Navbar title={`Add to ${store.name}`} backLink="Back" />
      <List form>
        <ListItem
          title="Product"
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
      </List>
      <Fab position="center-bottom" slot="fixed" text='submit' color="green" onClick={() => handleSubmit()}>
        <Icon ios="f7:check" aurora="f7:check" md="material:done"></Icon>
      </Fab>

      <Block strong className="error">
        <p>{error}</p>
      </Block>
    </Page>
  )
}
export default AddProduct
