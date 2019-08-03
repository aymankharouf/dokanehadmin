import React, {useState, useContext, useEffect } from 'react'
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
  useEffect(() => {
    const storeType = store ? store.storeType : null
    if (storeType === 'w') {
      const section = category ? state.sections.find(rec => rec.id === category.section) : null
      const percent = section ? section.percent : 0
      setPrice(parseFloat((1 + (percent / 100)) * purchasePrice).toFixed(3))
    } else {
      setPrice(purchasePrice)
    }
  }, [purchasePrice])

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
      if (offerEnd.length > 0 && new Date(offerEnd) < new Date()) {
        throw 'enter a valid offer end date'
      }
      const offerEndDate = offerEnd.length > 0 ? new Date(offerEnd) : ''
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
        offerEnd,
        imageUrl,
        image
      }).then(() => {
        props.f7router.back()
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
        <ListInput 
          name="name" 
          label="Name" 
          floatingLabel 
          clearButton
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          onInputClear={() => setName('')}
        />
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
        <ListInput 
          name="quantity" 
          label="Quantity" 
          clearButton
          floatingLabel 
          type="number" 
          value={quantity} 
          onChange={(e) => setQuantity(e.target.value)}
          onInputClear={() => setQuantity('')}
        />
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
        <ListInput 
          name="purchacePrice" 
          label="Purchase Price" 
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
