import {useState, useContext, useEffect, ChangeEvent, useRef } from 'react'
import {f7, Page, Navbar, List, ListItem, ListInput, Fab, Icon, ListButton, Toggle } from 'framework7-react'
import {StateContext } from '../data/state-provider'
import {addProduct, showMessage, showError, getMessage } from '../data/actions'
import labels from '../data/labels'
import {unitTypes } from '../data/config'
import {Unit } from '../data/types'

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
  const [unitType, setUnitType] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [packName, setPackName] = useState('')
  const [typeUnits, setTypeUnits] = useState(0)
  const [unitId, setUnitId] = useState('')
  const [byWeight, setByWeight] = useState(false)
  const [image, setImage] = useState<File>()
  const inputEl = useRef<HTMLInputElement | null>(null);
  const [units, setUnits] = useState<Unit[]>([])
  const [price, setPrice] = useState(productRequest?.price ?? 0)
  const [storeId, setStoreId] = useState(() => state.users.find(u => u.id === productRequest?.userId)?.storeId || '')
  const [categories] = useState(() => {
    const categories = state.categories.filter(c => c.isLeaf)
    return categories.sort((c1, c2) => c1.name > c2.name ? 1 : -1)
  })
  const [countries] = useState(() => [...state.countries].sort((c1, c2) => c1.name > c2.name ? 1 : -1))
  const [trademarks] = useState(() => [...state.trademarks].sort((t1, t2) => t1.name > t2.name ? 1 : -1))
  useEffect(() => {
    if (unitType !== 'w') {
      setByWeight(false)
    }
    setUnits(() => state.units.filter(u => u.type === unitType))
  }, [unitType, state.units])
  useEffect(() => {
    if (!byWeight) {
      setUnitId('')
      setTypeUnits(0)
    }
  }, [byWeight])
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
        unitType,
        imageUrl
      }
      const standardUnits = units.find(u => u.id === unitId)!.factor * typeUnits
      const prices = [{
        storeId, 
        price: +price, 
        time: new Date()
      }]
      const pack = {
        name: packName,
        product,
        prices,
        typeUnits,
        standardUnits,
        unitId,
        byWeight,
        isArchived: false,
        specialImage: false
      }
      addProduct(product, pack, productRequest, image)
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
          <select name="unitType" value={unitType} onChange={e => setUnitType(e.target.value)}>
            <option value=""></option>
            {unitTypes.map(t => 
              <option key={t.id} value={t.id}>{t.name}</option>
            )}
          </select>
        </ListItem>
        {unitType === 'w' &&
          <ListItem>
            <span>{labels.byWeight}</span>
            <Toggle 
              name="byWeight" 
              color="green" 
              checked={byWeight} 
              onToggleChange={() => setByWeight(s => !s)}
            />
          </ListItem>
        }
        {!byWeight &&
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
            <select name="unitId" value={unitId} onChange={e => setUnitId(e.target.value)}>
              <option value=""></option>
              {units.map(u => 
                <option key={u.id} value={u.id}>{u.name}</option>
              )}
            </select>
          </ListItem>
        }
        {!byWeight && 
          <ListInput 
            name="typeUnits" 
            label={labels.unitsCount}
            clearButton
            type="number" 
            value={typeUnits} 
            onChange={e => setTypeUnits(e.target.value)}
            onInputClear={() => setTypeUnits(0)}
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
          onInputClear={() => setPrice(0)}
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

      {name && categoryId && countryId && unitType && packName && unitId && typeUnits && price && storeId &&
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default AddProduct
