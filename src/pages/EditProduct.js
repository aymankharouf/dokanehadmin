import React, {useState, useContext } from 'react'
import {Page, Navbar, List, ListItem, ListInput, Fab, Icon, Block, Toggle} from 'framework7-react';
import { StoreContext } from '../data/Store';
import { editProduct } from '../data/Actions'


const EditProduct = props => {
  const { state, products } = useContext(StoreContext)
  const product = products.find(rec => rec.id === props.id)
  const [name, setName] = useState(product.name)
  const [description, setDescription] = useState(product.description)
  const [category, setCategory] = useState(product.category)
  const [trademark, setTrademark] = useState(product.trademark)
  const [byWeight, setByWeight] = useState(product.byWeight)
  const [isNew, setIsNew] = useState(product.isNew)
  const [isOffer, setIsOffer] = useState(product.isOffer)
  const [country, setCountry] = useState(product.country)
  const [imageUrl, setImageUrl] = useState(product.imageUrl)
  const [image, setImage] = useState(null)
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
  const handleSubmit = () => {
    try{
      if (name === '') {
        throw 'enter product name'
      }
      if (category === '') {
        throw 'enter product category'
      }
      if (description === '') {
        throw 'enter product description'
      }
      if (country === '') {
        throw 'enter product country'
      }
      if (imageUrl === '') {
        throw 'enter product image'
      }
      editProduct({
        id: props.id,
        category,
        name,
        description,
        trademark,
        byWeight,
        isNew,
        isOffer,
        country,
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
  return (
    <Page>
      <Navbar title={state.labels.editProduct} backLink="Back" />
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
          <select name="country" value={country} onChange={(e) => setCountry(e.target.value)}>
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
        <ListInput name="image" label="Image" type="file" accept="image/*" onChange={(e) => handleFileChange(e)}/>
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
export default EditProduct
