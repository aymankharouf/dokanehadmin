import React, {useState, useContext, useEffect, useMemo } from 'react'
import { Page, Navbar, List, ListItem, ListInput, Toggle, Fab, Icon } from 'framework7-react'
import { StoreContext } from '../data/store'
import { addProduct, showMessage, showError, getMessage } from '../data/actions'
import labels from '../data/labels'
import { storageTypes } from '../data/config'

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
  const handleFileChange = e => {
    const files = e.target.files
    const filename = files[0].name
    if (filename.lastIndexOf('.') <= 0) {
      setError(labels.invalidFile)
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
      showMessage(labels.addSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  return (
    <Page>
      <Navbar title={labels.addProduct} backLink={labels.back} />
      <List form>
        <ListInput 
          name="name" 
          label={labels.name}
          floatingLabel 
          clearButton
          type="text" 
          value={name} 
          onChange={e => setName(e.target.value)}
          onInputClear={() => setName('')}
        />
        <ListItem
          title={labels.category}
          smartSelect
          smartSelectParams={{
            openIn: "popup", 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close
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
          title={labels.trademark}
          smartSelect
          smartSelectParams={{
            openIn: "popup", 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close
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
          title={labels.country}
          smartSelect
          smartSelectParams={{
            openIn: "popup", 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close
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
          title={labels.tag}
          smartSelect
          smartSelectParams={{
            openIn: "popup", 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close
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
          title={labels.storage}
          smartSelect
          smartSelectParams={{
            openIn: "popup", 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close
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
          <span>{labels.isNew}</span>
          <Toggle 
          name="isNew" 
          color="green" 
          checked={isNew} 
          onToggleChange={() => setIsNew(!isNew)}/>
        </ListItem>
        <ListInput name="image" label={labels.image} type="file" accept="image/*" onChange={e => handleFileChange(e)}/>
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
