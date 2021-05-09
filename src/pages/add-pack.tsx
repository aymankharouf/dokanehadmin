import {useState, useContext, useEffect, ChangeEvent, useRef} from 'react'
import {addPack, showMessage, showError, getMessage} from '../data/actions'
import {f7, Page, Navbar, List, ListItem, ListInput, Fab, Icon, Toggle, ListButton} from 'framework7-react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import {units} from '../data/config'

type Props = {
  productId: string,
  requestId: string
}
const AddPack = (props: Props) => {
  const {state} = useContext(StateContext)
  const [error, setError] = useState('')
  const [packRequest] = useState(() => state.packRequests.find(r => r.id === props.requestId))
  const [pack] = useState(() => state.packs.find(p => p.id === packRequest?.siblingPackId))
  const [name, setName] = useState(packRequest?.name || '')
  const [unitsCount, setUnitsCount] = useState('')
  const [byWeight, setByWeight] = useState(pack?.byWeight || false)
  const [specialImage, setSpecialImage] = useState(packRequest?.specialImage || false)
  const [image, setImage] = useState<File>()
  const [product] = useState(() => state.products.find(p => p.id === props.productId)!)
  const [price, setPrice] = useState(packRequest?.price.toString() || '')
  const [storeId, setStoreId] = useState(packRequest?.storeId || '')
  const [forSale, setForSale] = useState(() => state.stores.find(s => s.id === storeId)?.type === 's')
  const [imageUrl, setImageUrl] = useState(product.imageUrl)
  const inputEl = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (byWeight) setUnitsCount('1')
  }, [byWeight])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  useEffect(() => {
    if (byWeight || unitsCount) setName(byWeight ? labels.byWeight : `${unitsCount} ${units.find(u => u.id === product.unit)?.name}`)
  }, [unitsCount, product, byWeight])
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
      if (state.packs.find(p => p.product.id === props.productId && p.name === name)) {
        throw new Error('duplicateName')
      }
      const stores = [{
        storeId, 
        price: +price, 
        isRetail: state.stores.find(s => s.id === storeId)!.type === 's', 
        isActive: true,
        time: new Date()
      }]
      const pack = {
        name,
        product,
        stores,
        unitsCount: +unitsCount,
        byWeight,
        isActive: true,
        specialImage,
        forSale,
        lastTrans: new Date()
      }
      addPack(pack, product, state.users, state.packRequests, packRequest, image)
      showMessage(labels.addSuccess)
      if (packRequest) f7.views.current.router.navigate('/home/')
      else f7.views.current.router.back()
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  return (
    <Page>
      <Navbar title={`${labels.addPack} ${product.name}`} backLink={labels.back} />
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
        <ListItem
          title={labels.store}
          disabled={!!packRequest}
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
        <ListItem>
          <span>{labels.specialImage}</span>
          <Toggle 
            name="specialImage" 
            color="green" 
            checked={specialImage} 
            onToggleChange={() => setSpecialImage(!specialImage)}
          />
        </ListItem>
        {specialImage &&
          <input 
            ref={inputEl}
            type="file" 
            accept="image/*" 
            style={{display: "none"}}
            onChange={e => handleFileChange(e)}
          />
        }
        {specialImage &&
          <ListButton title={labels.setImage} onClick={onUploadClick} />
        }
        {specialImage &&
          <img src={imageUrl} className="img-card" alt={labels.noImage} />
        }
      </List>
      {name && unitsCount &&
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default AddPack
