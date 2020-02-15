import React, { useState, useContext, useEffect, useRef } from 'react'
import { f7, Page, Navbar, List, ListItem, ListInput, Fab, Icon, FabButton, FabButtons, Actions, ActionsButton } from 'framework7-react'
import { StoreContext } from '../data/store'
import { addProduct, showMessage, showError, getMessage, getCategoryName, addTrademark, addCountry, addCategory } from '../data/actions'
import labels from '../data/labels'

const AddProduct = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [name, setName] = useState('')
  const [alias, setAlias] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState(props.id === '0' ? '' : props.id)
  const [trademark, setTrademark] = useState('')
  const [country, setCountry] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [image, setImage] = useState(null)
  const [packName, setPackName] = useState('')
  const [storeId, setStoreId] = useState('')
  const [price, setPrice] = useState('')
  const [categories, setCategories] = useState(() => {
    let categories = state.categories.filter(c => c.isLeaf)
    categories = categories.map(c => {
      return {
        id: c.id,
        name: getCategoryName(c, state.categories)
      }
    })
    return categories.sort((c1, c2) => c1.name > c2.name ? 1 : -1)
  })
  const [trademarks, setTrademarks] = useState(() => {
    const trademarks = state.lookups.find(l => l.id === 't')?.values || []
    return trademarks.sort((t1, t2) => t1 > t2 ? 1 : -1)
  })
  const [countries, setCountries] = useState(() => {
    const countries = state.lookups.find(l => l.id === 'c')?.values || []
    return countries.sort((c1, c2) => c1 > c2 ? 1 : -1)
  })
  const [stores] = useState(() => state.stores.filter(s => s.id !== 's'))
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
  const handleSubmit = async () => {
    try{
      if (storeId && Number(price) <= 0) {
        throw new Error('invalidPrice')
      }
      const product = {
        name,
        alias,
        description,
        categoryId,
        trademark,
        country,
        sales: 0,
        rating: 0,
        ratingCount: 0,
        imageUrl,
        isArchived: false
      }
      setInprocess(true)
      await addProduct(product, packName, storeId, price * 1000, image)
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
      <Navbar title={labels.addProduct} backLink={labels.back} />
      <List form inlineLabels>
        <ListInput 
          name="name" 
          label={labels.name}
          clearButton
          type="text" 
          value={name} 
          onChange={e => setName(e.target.value)}
          onInputClear={() => setName('')}
        />
        <ListInput 
          name="alias" 
          label={labels.alias}
          clearButton
          type="text" 
          value={alias} 
          onChange={e => setAlias(e.target.value)}
          onInputClear={() => setAlias('')}
        />
        <ListInput 
          name="description" 
          label={labels.description}
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
          name="packName" 
          label={labels.pack}
          clearButton
          type="text" 
          value={packName} 
          onChange={e => setPackName(e.target.value)}
          onInputClear={() => setPackName('')}
        />
        <ListItem
          title={labels.store}
          smartSelect
          smartSelectParams={{
            openIn: "popup", 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close
          }}
        >
          <select name="storeId" value={storeId} onChange={e => setStoreId(e.target.value)}>
            <option value=""></option>
            {stores.map(s => 
              <option key={s.id} value={s.id}>{s.name}</option>
            )}
          </select>
        </ListItem>
        <ListInput 
          name="price" 
          label={labels.price}
          value={price}
          clearButton 
          type="number" 
          onChange={e => setPrice(e.target.value)}
          onInputClear={() => setPrice('')}
        />
        <ListInput name="image" label={labels.image} type="file" accept="image/*" onChange={e => handleFileChange(e)}/>
        <img src={imageUrl} className="img-card" alt={labels.noImage} />
      </List>
      <Fab position="left-top" slot="fixed" color="orange" className="top-fab">
        <Icon material="keyboard_arrow_down"></Icon>
        <Icon material="close"></Icon>
        <FabButtons position="bottom">
          <FabButton color="blue" onClick={() => actionsList.current.open()}>
            <Icon material="build"></Icon>
          </FabButton>
          {!name ? '' :
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
export default AddProduct
