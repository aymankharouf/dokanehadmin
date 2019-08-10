import React, {useState, useContext, useEffect } from 'react'
import {Page, Navbar, List, ListItem, ListInput, Block, Toggle, Fab, Icon} from 'framework7-react';
import { StoreContext } from '../data/Store';
import { newProduct } from '../data/Actions'


const NewProduct = props => {
  const { state } = useContext(StoreContext)
  const store = state.stores.find(rec => rec.id === props.id)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [trademark, setTrademark] = useState('')
  const [size, setSize] = useState('')
  const [unit, setUnit] = useState('')
  const [isDivided, setIsDivided] = useState(false)
  const [isNew, setIsNew] = useState(false)
  const [country, setCountry] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [price, setPrice] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [image, setImage] = useState(null)
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
    if (category && purchasePrice) {
      if (store.storeType === 'w') {
        const currentCategory = state.categories.find(rec => rec.id === category)
        const section = state.sections.find(rec => rec.id === currentCategory.sectionId)
        const percent = section ? section.percent : 0
        setPrice(parseFloat((1 + (percent / 100)) * purchasePrice).toFixed(3))
      } else {
        setPrice(purchasePrice)
      }
    } else {
      setPrice('')
    }
  }, [category, purchasePrice])

  const handleSubmit = () => {
    try{
      if (name === '') {
        throw 'enter product name'
      }
      if (category === '') {
        throw 'enter product category'
      }
      if (size === '') {
        throw 'enter product size'
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
      newProduct({
        storeId: props.id,
        category,
        name,
        trademark,
        unit,
        isDivided,
        isNew,
        size,
        country,
        purchasePrice: parseFloat(purchasePrice).toFixed(3),
        price: parseFloat(price).toFixed(3),
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
      <Navbar title={`${state.labels.newProduct} ${store.name}`} backLink="Back" />
      <List form>
        <ListInput 
          name="name" 
          label={state.labels.name}
          floatingLabel 
          clearButton
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          onInputClear={() => setName('')}
        />
        <ListItem
          title={state.labels.category}
          smartSelect
          smartSelectParams={{openIn: 'popup', closeOnSelect: true, searchbar: true, searchbarPlaceholder: 'Search trademark'}}
        >
          <select name="category" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="" disabled></option>
            {categoriesOptionsTags}
          </select>
        </ListItem>
        <ListItem
          title={state.labels.trademark}
          smartSelect
          smartSelectParams={{openIn: 'popup', closeOnSelect: true, searchbar: true, searchbarPlaceholder: 'Search trademark'}}
        >
          <select name="trademark" value={trademark} onChange={(e) => setTrademark(e.target.value)}>
            <option value="" disabled></option>
            {trademarksOptionsTags}
          </select>
        </ListItem>
        <ListItem
          title={state.labels.country}
          smartSelect
          smartSelectParams={{openIn: 'popup', closeOnSelect: true, searchbar: true, searchbarPlaceholder: 'Search country'}}
        >
          <select name="country" defaultValue="" onChange={(e) => setCountry(e.target.value)}>
            <option value="" disabled></option>
            {countriesOptionsTags}
          </select>
        </ListItem>
        <ListInput 
          name="size" 
          label={state.labels.size}
          clearButton
          floatingLabel 
          type="number" 
          value={size} 
          onChange={(e) => setSize(e.target.value)}
          onInputClear={() => setSize('')}
        />
        <ListItem
          title={state.labels.unit}
          smartSelect
          smartSelectParams={{openIn: 'popup', closeOnSelect: true, searchbar: true, searchbarPlaceholder: 'Search unit'}}
        >
          <select name="unit" value={unit} onChange={(e) => setUnit(e.target.value)}>
            <option value="" disabled></option>
            {unitsOptionsTags}
          </select>
        </ListItem>
        <ListItem>
          <span>{state.labels.isDivided}</span>
          <Toggle name="isDivided" color="green" checked={isDivided} onToggleChange={() => setIsDivided(!isDivided)}/>
        </ListItem>
        <ListItem>
          <span>{state.labels.isNew}</span>
          <Toggle name="isNew" color="green" checked={isNew} onToggleChange={() => setIsNew(!isNew)}/>
        </ListItem>
        <ListInput 
          name="purchacePrice" 
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
        <ListInput name="image" label={state.labels.image} type="file" accept="image/*" onChange={(e) => handleFileChange(e)}/>
        <img src={imageUrl} alt=""/>
      </List>
      <Fab position="center-bottom" slot="fixed" text={state.labels.submit} color="green" onClick={() => handleSubmit()}>
        <Icon ios="f7:check" aurora="f7:check" md="material:done"></Icon>
      </Fab>

      <Block strong className="error">
        <p>{error}</p>
      </Block>
    </Page>
  )
}
export default NewProduct
