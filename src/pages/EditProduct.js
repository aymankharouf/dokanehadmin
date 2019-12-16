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
  const [categoryId, setCategoryId] = useState(product.categoryId)
  const [trademarkId, setTrademarkId] = useState(product.trademarkId)
  const [isNew, setIsNew] = useState(product.isNew)
  const [countryId, setCountryId] = useState(product.countryId)
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
    if (countryId !== product.countryId) return true
    if (categoryId !== product.categoryId) return true
    if (trademarkId !== product.trademarkId) return true
    if (isNew !== product.isNew) return true
    if (imageUrl !== product.imageUrl) return true
    return false
  }, [product, name, countryId, categoryId, trademarkId, isNew, imageUrl])
  useEffect(() => {
    if (error) {
      showError(props, error)
      setError('')
    }
  }, [error, props])

  const handleSubmit = async () => {
    try{
      const product = {
        id: props.id,
        categoryId,
        name,
        trademarkId,
        isNew,
        countryId,
        imageUrl
      }
      await editProduct(product, image)
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
            openIn: "popup", 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: state.labels.search,
            popupCloseLinkText: state.labels.close
          }}
        >
          <select name="categoryId" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
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
            openIn: "popup", 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: state.labels.search,
            popupCloseLinkText: state.labels.close
          }}
        >
          <select name="trademarkId" value={trademarkId} onChange={e => setTrademarkId(e.target.value)}>
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
            openIn: "popup", 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: state.labels.search,
            popupCloseLinkText: state.labels.close
          }}
        >
          <select name="countryId" value={countryId} onChange={e => setCountryId(e.target.value)}>
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
      {!name || !countryId || !categoryId || !imageUrl || !hasChanged ? '' :
        <Fab position="left-top" slot="fixed" color="green" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default EditProduct
