import React, { useState, useContext } from 'react'
import { addProduct } from '../data/Actions'
import {Page, Navbar, List, ListItem, ListInput, Button, Block, Toggle} from 'framework7-react';
import { StoreContext } from '../data/Store';


const AddProduct = props => {
  const { state, products } = useContext(StoreContext)
  const nonStoreProducts = products.filter(rec => rec.stores.findIndex(store => store.id === props.id) === -1)
  const store = state.stores.find(rec => rec.id === props.id)
  const [productId, setProductId] = useState('')
  const [product, setProduct] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [price, setPrice] = useState('')
  const [inStock, setInStock] = useState(store.inStock || '')
  const [hasOffer, setHasOffer] = useState(false)
  const [offerPurchasePrice, setOfferPurchasePrice] = useState(store.offerPurchasePrice || '')
  const [offerPrice, setOfferPrice] = useState(store.offerPrice || '')
  const [offerEnd, setOfferEnd] = useState(store.offerEnd || '')
  const [error, setError] = useState('')
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
      if (hasOffer) {
        if (offerPurchasePrice === '') {
          throw 'enter offer purchase price'
        }
        if (offerPrice === '') {
          throw 'enter offer price'
        }    
        if (offerPrice < offerPurchasePrice) {
          throw 'enter a valid offer price'
        }
        if (offerPrice > price) {
          throw 'enter a valid offer price'
        }
        if (offerEnd === '') {
          throw 'enter offer end date'
        }
        if (new Date(offerEnd) < new Date()) {
          throw 'enter a valid offer end date'
        }
      }
      addProduct(
        product,
        store,
        purchasePrice,
        price,
        inStock,
        offerPurchasePrice,
        offerPrice,
        offerEnd
      ).then(() => {
        props.f7router.navigate(`/store/${props.id}`)
      })
    } catch (err) {
      setError(err)
    }
  }
  const handleProductChange = e => {
    setProductId(e.target.value)
    setProduct(products.find(rec => rec.id === e.target.value))
  }
  const handlePurchasePriceChange = e => {
    const storeType = store ? store.storeType : null
    if (storeType === 'w') {
      const currentCategory = state.categories.find(rec => rec.id === product.category)
      const currentSection = currentCategory ? state.sections.find(rec => rec.id === currentCategory.section) : null
      const percent = currentSection ? currentSection.percent : 0
      setPrice(parseFloat(((1 + (percent / 100)) * e.target.value)).toFixed(3))
    } else {
      setPrice(e.target.value)
    }
    setPurchasePrice(e.target.value)
  }
  const handleOfferPurchasePriceChange = e => {
    const storeType = store ? store.storeType : null
    if (storeType === 'w') {
      const currentCategory = state.categories.find(rec => rec.id === product.category)
      const currentSection = currentCategory ? state.sections.find(rec => rec.id === currentCategory.section) : null
      const percent = currentSection ? currentSection.percent : 0
      setOfferPrice(parseFloat((1 + (percent / 100)) * e.target.value).toFixed(3))
    } else {
      setOfferPrice(e.target.value)
    }
    setOfferPurchasePrice(e.target.value)
  }
	const handleToggle = () => {
		if (hasOffer) {
			setOfferPurchasePrice('')
			setOfferPrice('')
			setOfferEnd('')
		}
		setHasOffer(!hasOffer)
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
        <img src={product.imageUrl} alt=""/>
        <ListInput name="puchasePrice" label="Puchase Price" value={purchasePrice} floatingLabel type="number" onChange={(e) => handlePurchasePriceChange(e)}/>
        <ListInput name="price" label="Price" value={price} floatingLabel type="number" onChange={(e) => setPrice(e.target.value)}/>
        <ListInput name="inStock" label="In Stock" floatingLabel type="number" value={inStock} onChange={(e) => setInStock(e.target.value)}/>
        <ListItem>
          <span>There is an offer?</span>
          <Toggle name="hasOffer" color="green" checked={hasOffer} onToggleChange={() => handleToggle()}/>
        </ListItem>
        {hasOffer ? 
       		<React.Fragment>
            <ListInput name="offerPurchasePrice" label="Offer Purchase Price" floatingLabel type="number" value={offerPurchasePrice} onChange={(e) => handleOfferPurchasePriceChange(e)}/>
            <ListInput name="offerPrice" label="Offer Price" floatingLabel type="number" value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)}/>
            <ListInput
              name="offerEnd"
              label="Offer End At"
              type="datepicker"
              value={offerEnd} 
              onCalendarChange={(value) => setOfferEnd(value)}
            />
        	</React.Fragment>
        : null}
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
