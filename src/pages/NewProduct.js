import React, {useState, useContext, useEffect } from 'react'
import {Page, Navbar, List, ListItem, ListInput, Block, Toggle, Fab, Icon} from 'framework7-react';
import { StoreContext } from '../data/Store';
import { newProduct } from '../data/Actions'


const NewProduct = props => {
  const { state } = useContext(StoreContext)
  const store = state.stores.find(rec => rec.id === props.id)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [trademark, setTrademark] = useState('')
  const [byWeight, setByWeight] = useState(false)
  const [isNew, setIsNew] = useState(false)
  const [isOffer, setIsOffer] = useState(false)
  const [country, setCountry] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [price, setPrice] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [image, setImage] = useState(null)
  const [offerEnd, setOfferEnd] = useState('')
  const [error, setError] = useState('')
  const handleFileChange = e => {
    const files = e.target.files
    const filename = files[0].name
    if (filename.lastIndexOf('.') <= 0) {
      setError(state.labels.invalidFile)
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
      if (store.type === 'w') {
        const currentCategory = state.categories.find(rec => rec.id === category)
        const section = state.sections.find(rec => rec.id === currentCategory.sectionId)
        const percent = section ? section.percent : 0
        setPrice(((1 + (percent / 100)) * purchasePrice).toFixed(3))
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
        throw new Error(state.labels.enterName)
      }
      if (description === '') {
        throw new Error(state.labels.enterDescription)
      }
      if (purchasePrice === '' || Number(purchasePrice) === 0) {
        throw new Error(state.labels.enterPurchasePrice)
      }
      if (price === '' || Number(price) === 0) {
        throw new Error(state.labels.enterPrice)
      }
      if (category === '') {
        throw new Error(state.labels.enterCategory)
      }
      if (country === '') {
        throw new Error(state.labels.enterCountry)
      }
      if (imageUrl === '') {
        throw new Error(state.labels.enterImage)
      }
      if ((price * 1000) < (purchasePrice * 1000)) {
        throw new Error(state.labels.invalidPrice)
      }
      if (offerEnd.length > 0 && new Date(offerEnd) < new Date()) {
        throw new Error(state.labels.invalidOfferEnd)
      }
      newProduct({
        storeId: props.id,
        category,
        name,
        description,
        trademark,
        byWeight,
        isNew,
        isOffer,
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
      setError(err.message)
    }
  }
  const categoriesOptionsTags = state.categories.map(rec => <option key={rec.id} value={rec.id}>{rec.name}</option>)
  const trademarksOptionsTags = state.trademarks.map(rec => <option key={rec.id} value={rec.id}>{rec.name}</option>)
  const countriesOptionsTags = state.countries.map(rec => <option key={rec.id} value={rec.id}>{rec.name}</option>)
  return (
    <Page>
      <Navbar title={`${state.labels.newProduct} - ${store.name}`} backLink="Back" />
      {error ? <Block strong className="error">{error}</Block> : null}
      <List form>
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
          name="name" 
          label={state.labels.name}
          floatingLabel 
          clearButton
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          onInputClear={() => setName('')}
        />
        <ListInput 
          name="description" 
          label={state.labels.description}
          floatingLabel 
          clearButton
          type="text" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)}
          onInputClear={() => setDescription('')}
        />
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
        <ListItem>
          <span>{state.labels.byWeight}</span>
          <Toggle name="byWeight" color="green" checked={byWeight} onToggleChange={() => setByWeight(!byWeight)}/>
        </ListItem>
        <ListItem>
          <span>{state.labels.isNew}</span>
          <Toggle name="isNew" color="green" checked={isNew} onToggleChange={() => setIsNew(!isNew)}/>
        </ListItem>
        <ListItem>
          <span>{state.labels.isOffer}</span>
          <Toggle name="isOffer" color="green" checked={isOffer} onToggleChange={() => setIsOffer(!isOffer)}/>
        </ListItem>
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
    </Page>
  )
}
export default NewProduct
