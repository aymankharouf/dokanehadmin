import {useState, useContext, useEffect, ChangeEvent} from 'react'
import {f7, Page, Navbar, List, ListItem, ListInput, Fab, Icon} from 'framework7-react'
import {StateContext} from '../data/state-provider'
import {editProduct, showMessage, showError, getMessage} from '../data/actions'
import labels from '../data/labels'
import {units} from '../data/config'

type Props = {
  id: string
}
const EditProduct = (props: Props) => {
  const {state} = useContext(StateContext)
  const [error, setError] = useState('')
  const [product] = useState(() => state.products.find(p => p.id === props.id)!)
  const [name, setName] = useState(product.name)
  const [alias, setAlias] = useState(product.alias)
  const [description, setDescription] = useState(product.description)
  const [categoryId, setCategoryId] = useState(product.categoryId)
  const [trademarkId, setTrademarkId] = useState(product.trademarkId)
  const [countryId, setCountryId] = useState(product.countryId)
  const [unit, setUnit] = useState('')
  const [imageUrl, setImageUrl] = useState(product.imageUrl)
  const [image, setImage] = useState<File>()
  const [fileErrorMessage, setFileErrorMessage] = useState('')
  const [hasChanged, setHasChanged] = useState(false)
  const [categories] = useState(() => [...state.categories].sort((c1, c2) => c1.name > c2.name ? 1 : -1))
  const [countries] = useState(() => [...state.countries].sort((c1, c2) => c1.name > c2.name ? 1 : -1))
  const [trademarks] = useState(() => [...state.trademarks].sort((t1, t2) => t1.name > t2.name ? 1 : -1))
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const filename = files[0].name
    if (filename.lastIndexOf('.') <= 0) {
      setFileErrorMessage(labels.invalidFile)
      return
    }
    const fileReader = new FileReader()
    fileReader.addEventListener('load', () => {
      if (fileReader.result) setImageUrl(fileReader.result.toString())
    })
    fileReader.readAsDataURL(files[0])
    setImage(files[0])
  }
  useEffect(() => {
    if (name !== product.name
    || alias !== product.alias
    || description !== product.description
    || countryId !== product.countryId
    || categoryId !== product.categoryId
    || trademarkId !== product.trademarkId
    || unit !== product.unit
    || imageUrl !== product.imageUrl) setHasChanged(true)
    else setHasChanged(false)
  }, [product, name, alias, description, countryId, categoryId, trademarkId, unit, imageUrl])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleSubmit = () => {
    try{
      if (state.products.find(p => p.id !== product.id && p.categoryId === categoryId && p.countryId === countryId && p.name === name)) {
        throw new Error('duplicateProduct')
      }
      const newProduct = {
        ...product,
        categoryId,
        name,
        alias,
        description,
        trademarkId,
        countryId,
        unit
      }
      editProduct(newProduct, product.name, state.packs, image)
      showMessage(labels.editSuccess)
      f7.views.current.router.back()
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  return (
    <Page>
      <Navbar title={labels.editProduct} backLink={labels.back} />
      <List form inlineLabels>
        <ListInput 
          name="name" 
          label={labels.name}
          clearButton
          autofocus
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
          value={name} 
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
          title={labels.trademark}
          smartSelect
          // @ts-ignore
          smartSelectParams={{
            // el: '#trademarks', 
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
          title={labels.category}
          smartSelect
          // @ts-ignore
          smartSelectParams={{
            // el: '#categories', 
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
          title={labels.country}
          smartSelect
          // @ts-ignore
          smartSelectParams={{
            // el: '#countries', 
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
          title={labels.unitType}
          smartSelect
          // @ts-ignore
          smartSelectParams={{
            // el: "#unitTypes", 
            openIn: "sheet",
            closeOnSelect: true, 
          }}
        >
          <select name="unitType" value={unit} onChange={e => setUnit(e.target.value)}>
            <option value=""></option>
            {units.map(u => 
              <option key={u.id} value={u.id}>{u.name}</option>
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
        <img src={imageUrl} className="img-card" alt={labels.noImage} />
      </List>
      {!name || !categoryId || !countryId || !hasChanged ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default EditProduct
