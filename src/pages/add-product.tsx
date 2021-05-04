import {useState, useContext, useEffect, ChangeEvent, useRef} from 'react'
import {f7, Page, Navbar, List, ListItem, ListInput, Fab, Icon, ListButton, Toggle, Input} from 'framework7-react'
import {StateContext } from '../data/state-provider'
import {addProduct, showMessage, showError, getMessage, addTrademark} from '../data/actions'
import labels from '../data/labels'
import {units} from '../data/config'

type Props = {
  id: string
}
const AddProduct = (props: Props) => {
  const {state} = useContext(StateContext)
  const [error, setError] = useState('')
  const [productRequest] = useState(() => state.productRequests.find(r => r.id === props.id))
  const [name, setName] = useState(productRequest?.name || '')
  const [alias, setAlias] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [trademarkId, setTrademarkId] = useState('')
  const [countryId, setCountryId] = useState('')
  const [unit, setUnit] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [packName, setPackName] = useState('')
  const [unitsCount, setUnitsCount] = useState('')
  const [byWeight, setByWeight] = useState(false)
  const [image, setImage] = useState<File>()
  const inputEl = useRef<HTMLInputElement | null>(null);
  const selectEl = useRef<HTMLInputElement | null>(null);
  const [price, setPrice] = useState(productRequest?.price.toString() || '')
  const [storeId, setStoreId] = useState(productRequest?.storeId || '')
  const [categories] = useState(() => {
    const categories = state.categories.filter(c => c.isLeaf)
    return categories.sort((c1, c2) => c1.name > c2.name ? 1 : -1)
  })
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const onUploadClick = () => {
    if (inputEl.current) inputEl.current.click();
  };
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const filename = files[0].name
    if (filename.lastIndexOf('.') <= 0) {
      setError(labels.invalidFile)
      return
    }
    const fileReader = new FileReader()
    fileReader.addEventListener('load', () => {
      if (fileReader.result) setImageUrl(fileReader.result.toString())
    })
    fileReader.readAsDataURL(files[0])
    setImage(files[0])
  }
  const handleTrademarkChange = (value: string) => {
    if (value === '0') {
      f7.dialog.prompt(labels.tradematk, labels.add, newValue => {
        try{
          if (state.trademarks.filter(t => t.name === newValue).length > 0) {
            throw new Error('duplicateName')
          }
          const id = Math.random().toString()
          addTrademark({
            id,
            name: newValue
          })
          setTrademarkId(id)
          const select = f7.smartSelect.get('#trademarks')
          select.setValue('hhhhhh')
        } catch(err) {
          setError(getMessage(f7.views.current.router.currentRoute.path, err))
        }
      })
    } else setTrademarkId(value)
  }
  const handleSubmit = () => {
    try{
      if (state.products.find(p => p.categoryId === categoryId && p.countryId === countryId && p.name === name && p.alias === alias)) {
        throw new Error('duplicateProduct')
      }
      const product = {
        name,
        alias,
        description,
        categoryId,
        trademarkId,
        countryId,
        rating: 0,
        ratingCount: 0,
        isArchived: false,
        unit,
        imageUrl
      }
      const prices = [{
        storeId, 
        price: +price, 
        time: new Date()
      }]
      const pack = {
        name: packName,
        product,
        prices,
        unitsCount: +unitsCount,
        byWeight,
        isArchived: false,
        specialImage: false
      }
      addProduct(product, pack, state.users, productRequest, image)
      showMessage(labels.addSuccess)
      if (productRequest) f7.views.current.router.navigate('/home/')
      else f7.views.current.router.back()
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  return (
    <Page>
      <Navbar title={labels.addProduct} backLink={labels.back} />
      <List form inlineLabels>
        <ListInput 
          name="name" 
          label={labels.name}
          clearButton
          autofocus
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          onInputClear={() => setName('')}
        />
        <ListInput 
          name="alias" 
          label={labels.alias}
          clearButton
          type="text" 
          value={alias} 
          onChange={(e) => setAlias(e.target.value)}
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
          className="ss"
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
          <select 
            id="test"
            name="trademarkId" 
            value={trademarkId} 
            onChange={e => handleTrademarkChange(e.target.value)} 
          >
            <option value=""></option>
            {state.trademarks.map(t => 
              <option key={t.id} value={t.id}>{t.name}</option>
            )}
            <option value="0">{labels.newValue}</option>
          </select>
        </ListItem>
        <ListItem
          title={labels.category}
          smartSelect
          // @ts-ignore
          smartSelectParams={{
            // el: '#categories',
            openIn: 'popup', 
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
            {state.countries.map(c => 
              <option key={c.id} value={c.id}>{c.name}</option>
            )}
          </select>
        </ListItem>
        <ListItem 
          title={labels.unit}
          smartSelect
          // @ts-ignore
          smartSelectParams={{
            // el: "#units", 
            openIn: "sheet",
            closeOnSelect: true, 
          }}
        >
          <select name="unit" value={unit} onChange={e => setUnit(e.target.value)}>
            <option value=""></option>
            {units.map(u => 
              <option key={u.id} value={u.id}>{u.name}</option>
            )}
          </select>
        </ListItem>
        <ListItem>
          <span>{labels.byWeight}</span>
          <Toggle 
            name="byWeight" 
            color="green" 
            checked={byWeight} 
            onToggleChange={() => setByWeight(s => !s)}
          />
        </ListItem>
        {!byWeight && 
          <ListInput 
            name="unitsCount" 
            label={labels.unitsCount}
            clearButton
            type="number" 
            value={unitsCount} 
            onChange={e => setUnitsCount(e.target.value)}
            onInputClear={() => setUnitsCount('')}
          />
        }
        <ListInput 
          name="packName" 
          label={labels.packName}
          clearButton
          type="text" 
          value={packName} 
          onChange={e => setPackName(e.target.value)}
          onInputClear={() => setPackName('')}
        />
        <ListItem
          title={labels.store}
          disabled={!!productRequest}
          smartSelect
          // @ts-ignore
          smartSelectParams={{
            // el: "#stores", 
            openIn: "popup",
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close
          }}
        >
          <select name="storeId" value={storeId} onChange={e => setStoreId(e.target.value)}>
            <option value=""></option>
            {state.stores.map(s => 
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
        <input 
          ref={inputEl}
          type="file" 
          accept="image/*" 
          style={{display: "none" }}
          onChange={e => handleFileChange(e)}
        />
        <ListButton title={labels.setImage} onClick={onUploadClick} />
        <img src={imageUrl} className="img-card" alt={labels.noImage} />

      </List>

      {name && categoryId && countryId && unit && packName && unitsCount && price && storeId &&
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
              <button onClick={() => console.log('ss == ', f7.smartSelect.get("ss"))}>test</button>

    </Page>
  )
}
export default AddProduct
