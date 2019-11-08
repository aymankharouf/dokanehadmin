import React, {useState, useContext, useEffect, useMemo } from 'react'
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
  const categoriesTags = useMemo(() => {
    const categories = state.categories
    categories.sort((rec1, rec2) => rec1.name > rec2.name ? 1 : -1)
    return categories.map(rec => 
      <option key={rec.id} value={rec.id}>{rec.name}</option>
    )
  }, [state.categories])
  const trademarksTags = useMemo(() => {
    const trademarks = state.trademarks
    trademarks.sort((rec1, rec2) => rec1.name > rec2.name ? 1 : -1)
    return trademarks.map(rec => 
      <option key={rec.id} value={rec.id}>{rec.name}</option>
    )
  }, [state.trademarks])
  const countriesTags = useMemo(() => {
    const countries = state.countries
    countries.sort((rec1, rec2) => rec1.name > rec2.name ? 1 : -1)
    return countries.map(rec => 
      <option key={rec.id} value={rec.id}>{rec.name}</option>
    )
  }, [state.countries]) 
  return (
    <Page>
      <Navbar title={state.labels.addProduct} backLink={state.labels.back} />
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
          smartSelectParams={{
            openIn: 'popup', 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: state.labels.search,
            popupCloseLinkText: state.labels.close
          }}
        >
          <select name='category' value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value=""></option>
            {categoriesTags}
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
            <option value=""></option>
            {trademarksTags}
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
            <option value=""></option>
            {countriesTags}
          </select>
        </ListItem>
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
      : <Fab position="left-top" slot="fixed" color="green" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default AddProduct
