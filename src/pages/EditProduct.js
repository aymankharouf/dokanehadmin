import React, {useState, useContext, useMemo } from 'react'
import {Page, Navbar, List, ListItem, ListInput, Fab, Icon, Block, Toggle } from 'framework7-react';
import { StoreContext } from '../data/Store';
import { editProduct, showMessage } from '../data/Actions'


const EditProduct = props => {
  const { state } = useContext(StoreContext)
  const product = useMemo(() => state.products.find(rec => rec.id === props.id), [state.products])
  const [name, setName] = useState(product.name)
  const [category, setCategory] = useState(product.category)
  const [trademark, setTrademark] = useState(product.trademark)
  const [byWeight, setByWeight] = useState(product.byWeight)
  const [isNew, setIsNew] = useState(product.isNew)
  const [isActive, setIsActive] = useState(product.isActive)
  const [country, setCountry] = useState(product.country)
  const [imageUrl, setImageUrl] = useState(product.imageUrl)
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
  const handleSubmit = () => {
    editProduct({
      id: props.id,
      category,
      name,
      trademark,
      byWeight,
      isNew,
      country,
      imageUrl,
      image,
      isActive
    }).then(() => {
      showMessage(props, 'success', state.labels.editSuccess)
      props.f7router.back()
    })  
  }
  const categoriesTags = useMemo(() => {
    let categories = state.categories.filter(rec => rec.isActive === true)
    categories.sort((rec1, rec2) => rec1.name > rec2.name ? 1 : -1)
    return categories.map(rec => 
      <option key={rec.id} value={rec.id}>{rec.name}</option>
    )
  }, [state.categories]) 
  const trademarksTags = useMemo(() => {
    let trademarks = state.trademarks.filter(rec => rec.isActive === true)
    trademarks.sort((rec1, rec2) => rec1.name > rec2.name ? 1 : -1)
    return trademarks.map(rec => 
      <option key={rec.id} value={rec.id}>{rec.name}</option>
    )
  }, [state.trademarks]) 
  const countriesTags = useMemo(() => {
    let countries = state.countries.filter(rec => rec.isActive === true)
    countries.sort((rec1, rec2) => rec1.name > rec2.name ? 1 : -1)
    return countries.map(rec => 
      <option key={rec.id} value={rec.id}>{rec.name}</option>
    )
  }, [state.countries]) 
  return (
    <Page>
      <Navbar title={state.labels.editProduct} backLink={state.labels.back} />
      {error ? <Block strong className="error">{error}</Block> : null}
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
          <select name="category" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="" disabled></option>
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
          <select name="trademark" value={trademark} onChange={(e) => setTrademark(e.target.value)}>
            <option value="" disabled></option>
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
          <select name="country" value={country} onChange={(e) => setCountry(e.target.value)}>
            <option value="" disabled></option>
            {countriesTags}
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
            onToggleChange={() => setByWeight(!byWeight)}
          />
        </ListItem>
        <ListItem>
          <span>{state.labels.isNew}</span>
          <Toggle 
            name="isNew" 
            color="green" 
            checked={isNew} 
            onToggleChange={() => setIsNew(!isNew)}
          />
        </ListItem>
        <ListItem>
          <span>{state.labels.isActive}</span>
          <Toggle 
            name="isActive" 
            color="green" 
            checked={isActive} 
            onToggleChange={() => setIsActive(!isActive)}
          />
        </ListItem>
        <ListInput name="image" label="Image" type="file" accept="image/*" onChange={(e) => handleFileChange(e)}/>
        <img src={imageUrl} alt=""/>
      </List>
      {!name || !country || !category || !imageUrl || (name === product.name && country === product.country && category === product.category && byWeight === product.byWeight && isNew === product.isNew && isActive === product.isActive && imageUrl === product.imageUrl) ? ''
      : <Fab position="left-bottom" slot="fixed" color="green" onClick={() => handleSubmit()}>
          <Icon ios="f7:check" aurora="f7:check" md="material:done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default EditProduct
