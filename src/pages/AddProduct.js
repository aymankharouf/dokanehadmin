import React, {useState, useContext, useEffect } from 'react'
import {Page, Navbar, List, ListItem, ListInput, Block, Toggle, Fab, Icon} from 'framework7-react';
import { StoreContext } from '../data/Store';
import { addProduct, showMessage } from '../data/Actions'


const AddProduct = props => {
  const { state } = useContext(StoreContext)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [trademark, setTrademark] = useState('')
  const [byWeight, setByWeight] = useState(false)
  const [isNew, setIsNew] = useState(false)
  const [country, setCountry] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [image, setImage] = useState(null)
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
    if (error) {
      showMessage(props, 'error', error)
      setError('')
    }
  }, [error])

  const handleSubmit = () => {
    addProduct({
      category,
      name,
      trademark,
      byWeight,
      isNew,
      country,
      imageUrl,
      image
    }).then(() => {
      showMessage(props, 'success', state.labels.addSuccess)
      props.f7router.back()
    }) 
  }
  let categories = state.categories.filter(rec => rec.isActive === true)
  categories.sort((category1, category2) => category1.name > category2.name ? 1 : -1)
  const categoriesOptionsTags = categories.map(rec => <option key={rec.id} value={rec.id}>{rec.name}</option>)
  let trademarks = state.trademarks.filter(rec => rec.isActive === true)
  trademarks.sort((trademark1, trademark2) => trademark1.name > trademark2.name ? 1 : -1)
  const trademarksOptionsTags = trademarks.map(rec => <option key={rec.id} value={rec.id}>{rec.name}</option>)
  let countries = state.countries.filter(rec => rec.isActive === true)
  countries.sort((country1, country2) => country1.name > country2.name ? 1 : -1)
  const countriesOptionsTags = countries.map(rec => <option key={rec.id} value={rec.id}>{rec.name}</option>)
  return (
    <Page>
      <Navbar title={state.labels.addProduct} backLink="Back" />
      <List form>
        <ListItem
          title={state.labels.category}
          smartSelect
          smartSelectParams={{
            openIn: 'popup', 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: state.labels.search,
            popupCloseLinkText: state.labels.close
          }}
        >
          <select name='category' value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="" disabled></option>
            {categoriesOptionsTags}
          </select>
        </ListItem>
        <ListItem
          title={state.labels.trademark}
          smartSelect
          smartSelectParams={{
            openIn: 'popup', 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: state.labels.search,
            popupCloseLinkText: state.labels.close
          }}
        >
          <select name='trademark' value={trademark} onChange={(e) => setTrademark(e.target.value)}>
            <option value="" disabled></option>
            {trademarksOptionsTags}
          </select>
        </ListItem>
        <ListItem
          title={state.labels.country}
          smartSelect
          smartSelectParams={{
            openIn: 'popup', 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: state.labels.search,
            popupCloseLinkText: state.labels.close
          }}
        >
          <select name='country' defaultValue="" onChange={(e) => setCountry(e.target.value)}>
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
        <ListItem>
          <span>{state.labels.byWeight}</span>
          <Toggle 
            name="byWeight" 
            color="green" 
            checked={byWeight} 
            onToggleChange={() => setByWeight(!byWeight)}/>
        </ListItem>
        <ListItem>
          <span>{state.labels.isNew}</span>
          <Toggle 
          name="isNew" 
          color="green" 
          checked={isNew} 
          onToggleChange={() => setIsNew(!isNew)}/>
        </ListItem>
        <ListInput name="image" label={state.labels.image} type="file" accept="image/*" onChange={(e) => handleFileChange(e)}/>
        <img src={imageUrl} alt=""/>
      </List>
      {!name || !country || !category || !imageUrl ? ''
      : <Fab position="left-bottom" slot="fixed" color="green" onClick={() => handleSubmit()}>
          <Icon ios="f7:check" aurora="f7:check" md="material:done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default AddProduct
