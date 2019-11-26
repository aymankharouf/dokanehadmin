import React, {useState, useContext, useMemo, useEffect } from 'react'
import { Page, Navbar, List, ListItem, ListInput, Fab, Icon, Toggle } from 'framework7-react';
import { StoreContext } from '../data/Store';
import { editProduct, showMessage, showError, getMessage } from '../data/Actions'


const EditProduct = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const product = useMemo(() => state.products.find(p => p.id === props.id)
  , [state.products, props.id])
  const [name, setName] = useState(product.name)
  const [category, setCategory] = useState(product.category)
  const [trademark, setTrademark] = useState(product.trademark)
  const [isNew, setIsNew] = useState(product.isNew)
  const [isActive, setIsActive] = useState(product.isActive)
  const [country, setCountry] = useState(product.country)
  const [imageUrl, setImageUrl] = useState(product.imageUrl)
  const [image, setImage] = useState('')
  const [fileErrorMessage, setFileErrorMessage] = useState('')
  const categories = useMemo(() => [...state.categories].sort((c1, c2) => c1.name > c2.name ? 1 : -1)
  , [state.categories]) 
  const trademarks = useMemo(() => [...state.trademarks].sort((t1, t2) => t1.name > t2.name ? 1 : -1)
  , [state.trademarks]) 
  const countries = useMemo(() => [...state.countries].sort((c1, c2) => c1.name > c2.name ? 1 : -1)
  , [state.countries]) 
  const handleFileChange = e => {
    const files = e.target.files
    const filename = files[0].name
    if (filename.lastIndexOf('.') <= 0) {
      setFileErrorMessage(state.labels.invalidFile)
      return
    }
    const fileReader = new FileReader()
    fileReader.addEventListener('load', () => {
      setImageUrl(fileReader.result)
    })
    fileReader.readAsDataURL(files[0])
    setImage(files[0])
  }
  const hasChanged = useMemo(() => {
    if (name !== product.name) return true
    if (country !== product.country) return true
    if (category !== product.category) return true
    if (trademark !== product.trademark) return true
    if (isNew !== product.isNew) return true
    if (imageUrl !== product.imageUrl) return true
    if (isActive !== product.isActive) return true
    return false
  }, [product, name, country, category, trademark, isNew, imageUrl, isActive])
  useEffect(() => {
    if (error) {
      showError(props, error)
      setError('')
    }
  }, [error, props])

  const handleSubmit = async () => {
    try{
      await editProduct({
        id: props.id,
        category,
        name,
        trademark,
        isNew,
        isActive,
        country,
        imageUrl,
        image
      })
      showMessage(props, state.labels.editSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(err, state.labels, props.f7route.route.component.name))
		}
  }
  return (
    <Page>
      <Navbar title={state.labels.editProduct} backLink={state.labels.back} />
      <List form>
        <ListInput 
          name="name" 
          label={state.labels.name}
          floatingLabel 
          clearButton
          type="text" 
          value={name} 
          onChange={e => setName(e.target.value)}
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
          <select name="category" value={category} onChange={e => setCategory(e.target.value)}>
            <option value=""></option>
            {categories.map(c => 
              <option key={c.id} value={c.id}>{c.name}</option>
            )}
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
            <option value=""></option>
            {trademarks.map(t => 
              <option key={t.id} value={t.id}>{t.name}</option>
            )}
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
            <option value=""></option>
            {countries.map(c => 
              <option key={c.id} value={c.id}>{c.name}</option>
            )}
          </select>
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
        <ListInput 
          name="image" 
          label="Image" 
          type="file" 
          accept="image/*" 
          errorMessage={fileErrorMessage}
          errorMessageForce
          onChange={e => handleFileChange(e)}
        />
        <img src={imageUrl} className="img-card" alt={name} />
      </List>
      {!name || !country || !category || !imageUrl || !hasChanged ? ''
      : <Fab position="left-top" slot="fixed" color="green" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default EditProduct
