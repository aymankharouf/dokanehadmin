import React, {useState, useContext } from 'react'
import {Page, Navbar, List, ListItem, ListInput, Button, Block, Toggle} from 'framework7-react';
import { StoreContext } from '../data/Store';
import { newProduct } from '../data/Actions'


const NewProduct = props => {
  const { state } = useContext(StoreContext)
  const store = state.stores.find(rec => rec.id === props.id)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [trademark, setTrademark] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('')
  const [byWeight, setByWeight] = useState(false)
  const [country, setCountry] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [price, setPrice] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [image, setImage] = useState(null)
  const [inStock, setInStock] = useState(store.inStock || '')
  const [hasOffer, setHasOffer] = useState(false)
  const [offerPurchasePrice, setOfferPurchasePrice] = useState(store.offerPurchasePrice || '')
  const [offerPrice, setOfferPrice] = useState(store.offerPrice || '')
  const [offerEnd, setOfferEnd] = useState(store.offerEnd || '')
  const [error, setError] = useState('')
  const handleFileChange = e => {
    const files = e.target.files
    const filename = files[0].name
    if (filename.lastIndexOf('.') <= 0) {
      setError('Please add a valid file')
      return
    }
    const fileReader = new FileReader()
    fileReader.addEventListener('load', () => {
      setImageUrl(fileReader.result)
    })
    fileReader.readAsDataURL(files[0])
    setImage(files[0])
  }
  const handlePurchasePriceChange = e => {
    const storeType = store ? store.storeType : null
    if (storeType === 'w') {
      const section = category ? state.sections.find(rec => rec.id === category.section) : null
      const percent = section ? section.percent : 0
      setPrice(parseFloat((1 + (percent / 100)) * e.target.value).toFixed(3))
    } else {
      setPrice(e.target.value)
    }
    setPurchasePrice(e.target.value)
  }
  const handleOfferPurchasePriceChange = e => {
    const storeType = store ? store.storeType : null
    if (storeType === 'w') {
      const section = category ? state.sections.find(rec => rec.id === category.section) : null
      const percent = section ? section.percent : 0
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
  const handleSubmit = () => {
    try{
      if (name === '') {
        throw 'enter product name'
      }
      if (category === '') {
        throw 'enter product category'
      }
      if (quantity === '') {
        throw 'enter product quantity'
      }
      if (unit === '') {
        throw 'enter product unit'
      }
      if (country === '') {
        throw 'enter product country'
      }
      if (purchasePrice === '') {
        throw 'enter product purshase price'
      }
      if (price === '') {
        throw 'enter product price'
      }
      if (imageUrl === '') {
        throw 'enter product image'
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
      newProduct({
        storeId: props.id,
        category,
        name,
        trademark,
        unit,
        byWeight,
        quantity,
        country,
        purchasePrice,
        price,
        inStock,
        offerPurchasePrice,
        offerPrice,
        offerEnd,
        imageUrl,
        image
      }).then(() => {
        props.f7router.navigate(`/store/${props.id}`)
      })  
    } catch (err){
      setError(err)
    }
  }
  const categoriesOptionsTags = state.categories.map(rec => <option key={rec.id} value={rec.id}>{rec.name}</option>)
  const trademarksOptionsTags = state.trademarks.map(rec => <option key={rec.id} value={rec.id}>{rec.name}</option>)
  const countriesOptionsTags = state.countries.map(rec => <option key={rec.id} value={rec.id}>{rec.name}</option>)
  const unitsOptionsTags = state.units.map(rec => <option key={rec.id} value={rec.id}>{rec.name}</option>)
  return (
    <Page>
      <Navbar title={`Add New Product to ${store.name}`} backLink="Back" />
      <List form>
        <ListInput name="name" label="Name" floatingLabel type="text" value={name} onChange={(e) => setName(e.target.value)}/>
        <ListItem
          title="Category"
          smartSelect
          smartSelectParams={{openIn: 'popup', closeOnSelect: true, searchbar: true, searchbarPlaceholder: 'Search trademark'}}
        >
          <select name="category" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="" disabled></option>
            {categoriesOptionsTags}
          </select>
        </ListItem>
        <ListItem
          title="Trademark"
          smartSelect
          smartSelectParams={{openIn: 'popup', closeOnSelect: true, searchbar: true, searchbarPlaceholder: 'Search trademark'}}
        >
          <select name="trademark" value={trademark} onChange={(e) => setTrademark(e.target.value)}>
            <option value="" disabled></option>
            {trademarksOptionsTags}
          </select>
        </ListItem>
        <ListItem
          title="Country"
          smartSelect
          smartSelectParams={{openIn: 'popup', closeOnSelect: true, searchbar: true, searchbarPlaceholder: 'Search country'}}
        >
          <select name="country" defaultValue="" onChange={(e) => setCountry(e.target.value)}>
            <option value="" disabled></option>
            {countriesOptionsTags}
          </select>
        </ListItem>
        <ListInput name="quantity" label="Quantity" floatingLabel type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)}/>
        <ListItem
          title="Unit"
          smartSelect
          smartSelectParams={{openIn: 'popup', closeOnSelect: true, searchbar: true, searchbarPlaceholder: 'Search unit'}}
        >
          <select name="unit" value={unit} onChange={(e) => setUnit(e.target.value)}>
            <option value="" disabled></option>
            {unitsOptionsTags}
          </select>
        </ListItem>
        <ListItem>
          <span>Can be ordered by weight</span>
          <Toggle name="byWeight" color="green" checked={byWeight} disabled={unit === '2' || unit === '3' ? false : true} onToggleChange={() => setByWeight(!byWeight)}/>
        </ListItem>
        <ListInput name="purchacePrice" label="Purchase Price" value={purchasePrice} floatingLabel type="number" onChange={(e) => handlePurchasePriceChange(e)}/>
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
        <ListInput name="image" label="Image" type="file" accept="image/*" onChange={(e) => handleFileChange(e)}/>
        <img src={imageUrl} alt=""/>
        <Button fill onClick={() => handleSubmit()}>Submit</Button>
      </List>
      <Block strong className="error">
        <p>{error}</p>
      </Block>
    </Page>
  )
}
export default NewProduct
