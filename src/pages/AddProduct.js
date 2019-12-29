import React, {useState, useContext, useEffect, useMemo } from 'react'
import { Page, Navbar, List, ListItem, ListInput, Toggle, Fab, Icon } from 'framework7-react'
import { StoreContext } from '../data/store'
import { addProduct, showMessage, showError, getMessage } from '../data/actions'
import labels from '../data/labels'


const AddProduct = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [trademarkId, setTrademarkId] = useState('')
  const [isNew, setIsNew] = useState(false)
  const [countryId, setCountryId] = useState('')
  const [tagId, setTagId] = useState('')
  const [storageId, setStorageId] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [image, setImage] = useState(null)
  const categories = useMemo(() => [...state.categories].sort((c1, c2) => c1.name > c2.name ? 1 : -1)
  , [state.categories])
  const trademarks = useMemo(() => [...state.trademarks].sort((c1, c2) => c1.name > c2.name ? 1 : -1)
  , [state.trademarks])
  const countries = useMemo(() => [...state.countries].sort((c1, c2) => c1.name > c2.name ? 1 : -1)
  , [state.countries]) 
  const tags = useMemo(() => [...state.tags].sort((t1, t2) => t1.name > t2.name ? 1 : -1)
  , [state.tags]) 
  const storageTypes = useMemo(() => [...state.storageTypes].sort((t1, t2) => t1.name > t2.name ? 1 : -1)
  , [state.storageTypes]) 
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
      showError(error)
      setError('')
    }
  }, [error])

  const handleSubmit = async () => {
    try{
      const product = {
        name,
        categoryId,
        trademarkId,
        isNew,
        countryId,
        tagId,
        storageId,
        imageUrl,
      }
      await addProduct(product, image)
      showMessage(state.labels.addSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
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
        <ListItem
          title={state.labels.tag}
          smartSelect
          smartSelectParams={{
            openIn: "popup", 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: state.labels.search,
            popupCloseLinkText: state.labels.close
          }}
        >
          <select name="tagId" value={tagId} onChange={e => setTagId(e.target.value)}>
            <option value=""></option>
            {tags.map(t => 
              <option key={t.id} value={t.id}>{t.name}</option>
            )}
          </select>
        </ListItem>
        <ListItem
          title={state.labels.storage}
          smartSelect
          smartSelectParams={{
            openIn: "popup", 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: state.labels.search,
            popupCloseLinkText: state.labels.close
          }}
        >
          <select name="storageId" value={storageId} onChange={e => setStorageId(e.target.value)}>
            <option value=""></option>
            {storageTypes.map(t => 
              <option key={t.id} value={t.id}>{t.name}</option>
            )}
          </select>
        </ListItem>
        <ListItem>
          <span>{state.labels.isNew}</span>
          <Toggle 
          name="isNew" 
          color="green" 
          checked={isNew} 
          onToggleChange={() => setIsNew(!isNew)}/>
        </ListItem>
        <ListInput name="image" label={state.labels.image} type="file" accept="image/*" onChange={e => handleFileChange(e)}/>
        <img src={imageUrl} className="img-card" alt={name} />
      </List>
      {!name || !countryId || !categoryId || !imageUrl ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default AddProduct
