import {useState, useContext, useEffect, ChangeEvent, useRef} from 'react'
import {f7, Page, Navbar, List, ListItem, ListInput, Fab, Icon, ListButton, Toggle, Actions, ActionsButton} from 'framework7-react'
import {StateContext } from '../data/state-provider'
import {addProduct, getMessage} from '../data/actions'
import labels from '../data/labels'
import {units} from '../data/config'
import { Category } from '../data/types'
import { useHistory, useLocation, useParams } from 'react-router'
import { useIonToast } from '@ionic/react'

type Params = {
  id: string
}
const AddProduct = () => {
  const {state} = useContext(StateContext)
  const params = useParams<Params>()
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [productRequest] = useState(() => state.productRequests.find(r => r.id === params.id))
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
  const [actionOpened, setActionOpened] = useState(false);
  const [price, setPrice] = useState(productRequest?.price.toFixed(2) || '')
  const [storeId, setStoreId] = useState(productRequest?.storeId || '')
  const [forSale, setForSale] = useState(() => state.stores.find(s => s.id === storeId)?.type === 's')
  const [categories, setCategories] = useState<Category[]>([])
  useEffect(() => {
    setCategories(() => {
      const categories = state.categories.filter(c => c.isLeaf)
      return categories.sort((c1, c2) => c1.name > c2.name ? 1 : -1)
    })
  }, [state.categories])
  useEffect(() => {
    if (byWeight) setUnitsCount('1')
  }, [byWeight])
  useEffect(() => {
    if (unit && (byWeight || unitsCount)) setPackName(byWeight ? labels.byWeight : `${unitsCount} ${units.find(u => u.id === unit)?.name}`)
  }, [unitsCount, unit, byWeight])
  const onUploadClick = () => {
    if (inputEl.current) inputEl.current.click();
  };
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    try {
      const files = e.target.files
      if (!files) return
      const filename = files[0].name
      if (filename.lastIndexOf('.') <= 0) {
        throw new Error('invalidFile')
      }
      const fileReader = new FileReader()
      fileReader.addEventListener('load', () => {
        if (fileReader.result) setImageUrl(fileReader.result.toString())
      })
      fileReader.readAsDataURL(files[0])
      setImage(files[0])
    } catch (err) {
      message(getMessage(location.pathname, err), 3000)
    }
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
        isActive: true,
        unit,
        imageUrl
      }
      const stores = [{
        storeId, 
        price: +price, 
        isRetail: state.stores.find(s => s.id === storeId)!.type === 's', 
        isActive: true,
        time: new Date()
      }]
      const pack = {
        name: packName,
        product,
        stores,
        unitsCount: +unitsCount,
        byWeight,
        isActive: true,
        forSale,
        lastTrans: new Date()
      }
      addProduct(product, pack, state.users, productRequest, state.productRequests, image)
      message(labels.addSuccess, 3000)
      if (productRequest) history.push('/')
      else history.goBack()
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
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
            name="trademarkId" 
            value={trademarkId} 
            onChange={e =>setTrademarkId(e.target.value)} 
          >
            <option value=""></option>
            {state.trademarks.map(t => 
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
          <span>{labels.forSale}</span>
          <Toggle 
            name="forSale" 
            color="green" 
            checked={forSale} 
            onToggleChange={() => setForSale(s => !s)}
          />
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
      <Fab position="right-top" slot="fixed" className="top-fab" onClick={() => setActionOpened(true)}>
        <Icon material="add"></Icon>
      </Fab>
      <Actions opened={actionOpened} onActionsClosed={() => setActionOpened(false)}>
        <ActionsButton onClick={() => f7.views.current.router.navigate('/add-trademark/')}>
          {labels.addTrademark}
        </ActionsButton>
        <ActionsButton onClick={() => f7.views.current.router.navigate('/add-country/')}>
          {labels.addCountry}
        </ActionsButton>
        <ActionsButton onClick={() => f7.views.current.router.navigate('/add-category/0')}>
          {labels.addCategory}
        </ActionsButton>
      </Actions>
    </Page>
  )
}
export default AddProduct
