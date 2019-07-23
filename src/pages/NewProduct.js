import React, {useState, useContext } from 'react'
import {Page, Navbar, List, ListItem, ListInput, Button} from 'framework7-react';
import { StoreContext } from '../data/Store';
import { newProduct } from '../data/Actions'


const NewProduct = props => {
  /*componentDidUpdate(){
    if (this.$f7router.currentRoute.name === 'newProduct' && this.props.result.finished && this.props.result.message === '') this.$f7router.navigate(`/storeCategory/${this.props.storeId}/category/${this.props.category.id}`)
  }*/
  const { state } = useContext(StoreContext)
  const [name, setName] = useState('')
  const [trademark, setTrademark] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('')
  const [country, setCountry] = useState('')
  const [price, setPrice] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [image, setImage] = useState(null)
  const handleFileChange = e => {
    const files = e.target.files
    const filename = files[0].name
    if (filename.lastIndexOf('.') <= 0) {
      return alert('Please add a valid file')
    }
    const fileReader = new FileReader()
    fileReader.addEventListener('load', () => {
      setImageUrl(fileReader.result)
    })
    fileReader.readAsDataURL(files[0])
    setImage(files[0])
  }
  const handleSubmit = () => {
    newProduct({
      category: props.categoryId,
      storeId: props.storeId,
      name,
      trademark,
      unit,
      quantity,
      country,
      price,
      imageUrl,
      image
    }).then(() => {
      props.f7router.navigate(`/storeCategory/${props.storeId}/category/${props.categoryId}`)
    })
  }
  const trademarksOptionsTags = state.trademarks.map(trademark => <option key={trademark.id} value={trademark.id}>{trademark.name}</option>)
  const countriesOptionsTags = state.countries.map(country => <option key={country.id} value={country.id}>{country.name}</option>)
  const unitsOptionsTags = state.units.map(unit => <option key={unit.id} value={unit.id}>{unit.name}</option>)
  return (
    <Page>
      <Navbar title="Form" backLink="Back" />
      <List form>
        <ListInput name="name" label="Name" floatingLabel type="text" onChange={(e) => setName(e.target.value)}/>
        <ListItem
          title="Trademark"
          smartSelect
          smartSelectParams={{openIn: 'popup', closeOnSelect: true, searchbar: true, searchbarPlaceholder: 'Search trademark'}}
        >
          <select name="trademark" defaultValue="" onChange={(e) => setTrademark(e.target.value)}>
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
        <ListInput name="quantity" label="Quantity" floatingLabel type="number" onChange={(e) => setQuantity(e.target.value)}/>
        <ListItem
          title="Unit"
          smartSelect
          smartSelectParams={{openIn: 'popup', closeOnSelect: true, searchbar: true, searchbarPlaceholder: 'Search unit'}}
        >
          <select name="unit" defaultValue="" onChange={(e) => setUnit(e.target.value)}>
            <option value="" disabled></option>
            {unitsOptionsTags}
          </select>
        </ListItem>
        <ListInput name="price" label="Price" floatingLabel type="number" onChange={(e) => setPrice(e.target.value)}/>
        <ListInput name="image" label="Image" type="file" accept="image/*" onChange={(e) => handleFileChange(e)}/>
        <img src={imageUrl} alt=""/>
        <Button fill onClick={() => handleSubmit()}>Submit</Button>
      </List>
    </Page>
  )
}
export default NewProduct
