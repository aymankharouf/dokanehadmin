import React, { useState, useContext, useEffect, useRef } from 'react'
import { f7, Page, Navbar, List, ListItem, ListInput, Fab, Icon, FabButtons, FabButton, Actions, ActionsButton } from 'framework7-react'
import { StoreContext } from '../data/store'
import { editProduct, showMessage, showError, getMessage, addTrademark, addCountry, addCategory } from '../data/actions'
import labels from '../data/labels'

const EditProduct = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [product] = useState(() => state.products.find(p => p.id === props.id))
  const [name, setName] = useState(product.name)
  const [alias, setAlias] = useState(product.alias)
  const [description, setDescription] = useState(product.description)
  const [categoryId, setCategoryId] = useState(product.categoryId)
  const [trademark, setTrademark] = useState(product.trademark)
  const [country, setCountry] = useState(product.country)
  const [imageUrl, setImageUrl] = useState(product.imageUrl)
  const [image, setImage] = useState('')
  const [fileErrorMessage, setFileErrorMessage] = useState('')
  const [hasChanged, setHasChanged] = useState(false)
  const [categories] = useState(() => [...state.categories].sort((c1, c2) => c1.name > c2.name ? 1 : -1))
  const [trademarks, setTrademarks] = useState(() => {
    const trademarks = state.lookups.find(l => l.id === 't')?.values || []
    return trademarks.sort((t1, t2) => t1 > t2 ? 1 : -1)
  })
  const [countries, setCountries] = useState(() => {
    const countries = state.lookups.find(l => l.id === 'c')?.values || []
    return countries.sort((c1, c2) => c1 > c2 ? 1 : -1)
  })
  const actionsList = useRef('')
  const handleFileChange = e => {
    const files = e.target.files
    const filename = files[0].name
    if (filename.lastIndexOf('.') <= 0) {
      setFileErrorMessage(labels.invalidFile)
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
    if (name !== product.name
    || alias !== product.alias
    || description !== product.description
    || country !== product.country
    || categoryId !== product.categoryId
    || trademark !== product.trademark
    || imageUrl !== product.imageUrl) setHasChanged(true)
    else setHasChanged(false)
  }, [product, name, alias, description, country, categoryId, trademark, imageUrl])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  useEffect(() => {
    if (inprocess) {
      f7.dialog.preloader(labels.inprocess)
    } else {
      f7.dialog.close()
    }
  }, [inprocess])

  const handleSubmit = async () => {
    try{
      const newProduct = {
        ...product,
        categoryId,
        name,
        alias,
        description,
        trademark,
        country,
        imageUrl
      }
      setInprocess(true)
      await editProduct(newProduct, product.name, image, state.packs)
      setInprocess(false)
      showMessage(labels.editSuccess)
      props.f7router.back()
    } catch(err) {
      setInprocess(false)
			setError(getMessage(props, err))
		}
  }
  const handleAddTrademark = () => {
    f7.dialog.prompt(labels.enterName, labels.newTrademark, async name => {
      try{
        if (!name) {
          throw new Error('invalidValue')
        }
        const trademarks = state.lookups.find(l => l.id === 't')?.values || []
        setInprocess(true)
        await addTrademark(name)
        setTrademarks(trademarks.concat(name))
        setInprocess(false)
        showMessage(labels.addSuccess)
      } catch(err) {
        setInprocess(false)
			  setError(getMessage(props, err))
      }
    })    
  }
  const handleAddCountry = () => {
    f7.dialog.prompt(labels.enterName, labels.newCountry, async name => {
      try{
        if (!name) {
          throw new Error('invalidValue')
        }
        const countries = state.lookups.find(l => l.id === 'c')?.values || []
        setInprocess(true)
        await addCountry(name)
        setCountries(countries.concat(name))
        setInprocess(false)
        showMessage(labels.addSuccess)
      } catch(err) {
        setInprocess(false)
			  setError(getMessage(props, err))
      }
    })    
  }
  const handleAddCategory = () => {
    f7.dialog.prompt(labels.enterName, labels.newCategory, async name => {
      try{
        if (!name) {
          throw new Error('invalidValue')
        }
        setInprocess(true)
        await addCategory('0', name, 0)
        setInprocess(false)
        showMessage(labels.addSuccess)
      } catch(err) {
        setInprocess(false)
			  setError(getMessage(props, err))
      }
    })    
  }

  return (
    <Page>
      <Navbar title={labels.editProduct} backLink={labels.back} />
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
        <ListInput 
          name="alias" 
          label={labels.alias}
          floatingLabel 
          clearButton
          type="text" 
          value={alias} 
          onChange={e => setAlias(e.target.value)}
          onInputClear={() => setAlias('')}
        />
        <ListInput 
          name="description" 
          label={labels.description}
          floatingLabel 
          clearButton
          type="text" 
          value={description} 
          onChange={e => setDescription(e.target.value)}
          onInputClear={() => setDescription('')}
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
          <select name="trademark" value={trademark} onChange={e => setTrademark(e.target.value)}>
            <option value=""></option>
            {trademarks.map(t => 
              <option key={t} value={t}>{t}</option>
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
          <select name="country" value={country} onChange={e => setCountry(e.target.value)}>
            <option value=""></option>
            {countries.map(c => 
              <option key={c} value={c}>{c}</option>
            )}
          </select>
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
      <Fab position="left-top" slot="fixed" color="orange" className="top-fab">
        <Icon material="keyboard_arrow_down"></Icon>
        <Icon material="close"></Icon>
        <FabButtons position="bottom">
          <FabButton color="blue" onClick={() => actionsList.current.open()}>
            <Icon material="build"></Icon>
          </FabButton>
          {!name || !country || !categoryId || !imageUrl || !hasChanged ? '' :
            <FabButton color="green" onClick={() => handleSubmit()}>
              <Icon material="done"></Icon>
            </FabButton>
          }
        </FabButtons>
      </Fab>
      <Actions ref={actionsList}>
        <ActionsButton onClick={() => handleAddCategory()}>{labels.newCategory}</ActionsButton>
        <ActionsButton onClick={() => handleAddTrademark()}>{labels.newTrademark}</ActionsButton>
        <ActionsButton onClick={() => handleAddCountry()}>{labels.newCountry}</ActionsButton>
      </Actions>

    </Page>
  )
}
export default EditProduct
