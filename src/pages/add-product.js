import React, { useState, useContext, useEffect, useRef } from 'react'
import { f7, Page, Navbar, List, ListItem, ListInput, Fab, Icon, FabButton, FabButtons, Actions, ActionsButton } from 'framework7-react'
import { StoreContext } from '../data/store'
import { addProduct, showMessage, showError, getMessage, getCategoryName, addTrademark, addCountry, addTag, addCategory } from '../data/actions'
import labels from '../data/labels'

const AddProduct = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [trademark, setTrademark] = useState('')
  const [country, setCountry] = useState('')
  const [tag, setTag] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [image, setImage] = useState(null)
  const [categories, setCategories] = useState([])
  const [trademarks, setTrademarks] = useState([])
  const [countries, setCountries] = useState([])
  const [tags, setTags] = useState([])
  const actionsList = useRef('')
  useEffect(() => {
    setCategories(() => {
      let categories = state.categories.filter(c => c.isLeaf)
      categories = categories.map(c => {
        return {
          id: c.id,
          name: getCategoryName(c, state.categories)
        }
      })
      return categories.sort((c1, c2) => c1.name > c2.name ? 1 : -1)
    })
  }, [state.categories])
  useEffect(() => {
    setCountries(() => {
      const countries = state.lookups.find(l => l.id === 'c')?.values || []
      return countries.sort((c1, c2) => c1 > c2 ? 1 : -1)
    })
    setTrademarks(() => {
      const trademarks = state.lookups.find(l => l.id === 'm')?.values || []
      return trademarks.sort((t1, t2) => t1 > t2 ? 1 : -1)
    })
    setTags(() => {
      const tags = state.lookups.find(l => l.id === 't')?.values || []
      return tags.sort((t1, t2) => t1 > t2 ? 1 : -1)
    })
  }, [state.lookups])
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
  useEffect(() => {
    if (inprocess) {
      f7.dialog.preloader(labels.inprocess)
    } else {
      f7.dialog.close()
    }
  }, [inprocess])

  const handleSubmit = async () => {
    try{
      const product = {
        name,
        categoryId,
        trademark,
        country,
        tag,
        sales: 0,
        rating: 0,
        ratingCount: 0,
        imageUrl,
        isArchived: false,
        time: new Date()
      }
      setInprocess(true)
      await addProduct(product, image)
      setInprocess(false)
      showMessage(labels.addSuccess)
      props.f7router.back()
    } catch(err) {
      setInprocess(false)
			setError(getMessage(props, err))
		}
  }
  const handleAddTrademark = () => {
    f7.dialog.prompt(labels.enterName, labels.newTrademark, async name => {
      try{
        const trademarks = state.lookups.find(l => l.id === 'm')?.values || []
        setInprocess(true)
        await addTrademark(name, trademarks)
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
        const countries = state.lookups.find(l => l.id === 'c')?.values || []
        setInprocess(true)
        await addCountry(name, countries)
        setInprocess(false)
        showMessage(labels.addSuccess)
      } catch(err) {
        setInprocess(false)
			  setError(getMessage(props, err))
      }
    })    
  }
  const handleAddTag = () => {
    f7.dialog.prompt(labels.enterName, labels.newTag, async name => {
      try{
        const tags = state.lookups.find(l => l.id === 't')?.values || []
        setInprocess(true)
        await addTag(name, tags)
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
          <select name="categoryId" defaultValue={categoryId} onChange={e => setCategoryId(e.target.value)}>
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
          <select name="trademark" defaultValue={trademark} onChange={e => setTrademark(e.target.value)}>
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
          <select name="country" defaultValue={country} onChange={e => setCountry(e.target.value)}>
            <option value=""></option>
            {countries.map(c => 
              <option key={c} value={c}>{c}</option>
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
          <select name="tag" defaultValue={tag} onChange={e => setTag(e.target.value)}>
            <option value=""></option>
            {tags.map(t => 
              <option key={t} value={t}>{t}</option>
            )}
          </select>
        </ListItem>
        <ListInput name="image" label={labels.image} type="file" accept="image/*" onChange={e => handleFileChange(e)}/>
        <img src={imageUrl} className="img-card" alt={name} />
      </List>
      <Fab position="left-top" slot="fixed" color="orange" className="top-fab">
        <Icon material="keyboard_arrow_down"></Icon>
        <Icon material="close"></Icon>
        <FabButtons position="bottom">
          <FabButton color="blue" onClick={() => actionsList.current.open()}>
            <Icon material="build"></Icon>
          </FabButton>
          {!name || !country || !categoryId || !imageUrl ? '' :
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
        <ActionsButton onClick={() => handleAddTag()}>{labels.newTag}</ActionsButton>
      </Actions>

    </Page>
  )
}
export default AddProduct
