import React, {useState, useContext } from 'react'
import {Page, Navbar, List, ListItem, ListInput, Button, Block, Toggle} from 'framework7-react';
import { StoreContext } from '../data/Store';
import { editProduct } from '../data/Actions'


const EditProduct = props => {
  const { state, products } = useContext(StoreContext)
  const product = products.find(rec => rec.id === props.id)
  const [name, setName] = useState(product.name)
  const [category, setCategory] = useState(product.category)
  const [trademark, setTrademark] = useState(product.trademark)
  const [quantity, setQuantity] = useState(product.quantity)
  const [unit, setUnit] = useState(product.unit)
  const [byWeight, setByWeight] = useState(false)
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
      if (quantity === '') {
        throw 'enter product quantity'
      }
      if (unit === '') {
        throw 'enter product unit'
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
        trademark,
        unit,
        byWeight,
        quantity,
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
  const unitsOptionsTags = state.units.map(rec => <option key={rec.id} value={rec.id}>{rec.name}</option>)
  return (
    <Page>
      <Navbar title='Edit Product' backLink="Back" />
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
          <select name="country" value={country} onChange={(e) => setCountry(e.target.value)}>
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
          <Toggle name="byWeight" color="green" checked={byWeight} disabled={unit === '2' || unit === '3' ? false : true} onChange={() => setByWeight(!byWeight)}/>
        </ListItem>
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
export default EditProduct
