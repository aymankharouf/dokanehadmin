import React, {useState, useContext } from 'react'
import {Page, Navbar, List, ListItem, ListInput, Button, Block, Toggle} from 'framework7-react';
import { StoreContext } from '../data/Store';
import { editPrice } from '../data/Actions'


const EditPrice = props => {
  const { state, products } = useContext(StoreContext)
  const product = products.find(rec => rec.id === props.productId)
	const store = product.stores.find(rec => rec.id === props.storeId)
  const [purchasePrice, setPurchasePrice] = useState(store.purchasePrice || '')
  const [price, setPrice] = useState(store.price)
  const [inStock, setInStock] = useState(store.inStock || '')
  const [hasOffer, setHasOffer] = useState(false)
  const [offerPurchasePrice, setOfferPurchasePrice] = useState(store.offerPurchasePrice || '')
  const [offerPrice, setOfferPrice] = useState(store.offerPrice || '')
  const [offerEnd, setOfferEnd] = useState(store.offerEnd || '')
  const [imageUrl, setImageUrl] = useState(product.imageUrl)
  const [error, setError] = useState('')
  const handlePurchasePriceChange = e => {
    const storeType = store ? store.storeType : null
    if (storeType === 'w') {
      const currentCategory = state.categories.find(rec => rec.id === product.category)
      const currentSection = currentCategory ? state.sections.find(rec => rec.id === currentCategory.section) : null
      const percent = currentSection ? currentSection.percent : 0
      setPrice(parseFloat((1 + (percent / 100)) * e.target.value).toFixed(3))
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
  const handleEdit = () => {
    try{
      if (purchasePrice === '') {
        throw 'enter purchase price'
      }
      if (price === '') {
        throw 'enter price'
      }
      if (hasOffer) {
        if (offerPurchasePrice === '') {
            throw 'enter offer purchase price'
          }
          if (offerPrice === '') {
            throw 'enter offer price'
          }    
          if (offerEnd === '') {
            throw 'enter offer end date'
          }
      }
      editPrice({
        product,
        store,
        purchasePrice,
        price,
        offerPurchasePrice,
        offerPrice,
        inStock,
        offerEnd
      }).then(() => {
        props.f7router.navigate(`/storeProduct/${props.storeId}/product/${props.productId}`)
      })  
    } catch (err){
      setError(err)
    }
  }
  return (
    <Page>
      <Navbar title='Edit Price' backLink="Back" />
      <List form>
        <img src={imageUrl} alt=""/>
        <ListInput name="purchasePrice" label="Purchase Price" floatingLabel type="number" value={purchasePrice} onChange={(e) => handlePurchasePriceChange(e)}/>
        <ListInput name="price" label="Price" floatingLabel type="number" value={price} onChange={(e) => setPrice(e.target.value)}/>
        <ListInput name="inStock" label="In Stock" floatingLabel type="number" value={inStock} onChange={(e) => setInStock(e.target.value)}/>
        <ListItem>
          <span>There is an offer?</span>
          <Toggle name="hasOffer" color="green" checked={hasOffer} onToggleChange={() => handleToggle()}/>
        </ListItem>
        {hasOffer ? 
       		<React.Fragment>
            <ListInput name="offerPurchasePrice" label="Offer Purchase Price" floatingLabel type="number" value={offerPurchasePrice} onChange={(e) => handleOfferPurchasePriceChange(e)}/>
            <ListInput name="offerPrice" label="Offer Price" floatingLabel type="number" value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)}/>
            <ListInput name="offerEnd" label="Offer End At" floatingLabel type="date" value={offerEnd} onChange={(e) => setOfferEnd(e.target.value)}/>
        	</React.Fragment>
        : null}
        <Button fill onClick={(e) => handleEdit(e)}>Submit</Button>
      </List>
      <Block strong className="error">
        <p>{error}</p>
      </Block>
    </Page>
  )
}
export default EditPrice
