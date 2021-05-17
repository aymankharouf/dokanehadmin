import {useState, useContext, useEffect, ChangeEvent, useRef} from 'react'
import {addPack, showMessage, showError, getMessage} from '../data/actions'
import {f7, Page, Navbar, List, ListItem, ListInput, Fab, Icon, Toggle, ListButton} from 'framework7-react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'

type Props = {
  productId: string,
  requestId: string
}
const AddGroup = (props: Props) => {
  const {state} = useContext(StateContext)
  const [error, setError] = useState('')
  const [packRequest] = useState(() => state.packRequests.find(r => r.id === props.requestId))
  const [name, setName] = useState(packRequest?.name || '')
  const [subPackId, setSubPackId] = useState(packRequest?.siblingPackId || '')
  const [subCount, setSubCount] = useState(packRequest?.subCount || '')
  const [specialImage, setSpecialImage] = useState(!!packRequest?.imageUrl || false)
  const [withGift, setWithGift] = useState(false)
  const [image, setImage] = useState<File>()
  const [gift, setGift] = useState(packRequest?.gift || '')
  const [product] = useState(() => state.products.find(p => p.id === props.productId)!)
  const [price, setPrice] = useState(packRequest?.price.toFixed(2) || '')
  const [storeId, setStoreId] = useState(packRequest?.storeId || '')
  const [forSale, setForSale] = useState(() => state.stores.find(s => s.id === storeId)?.type === 's')
  const [packs] = useState(() => state.packs.filter(p => p.product.id === props.productId && !p.byWeight))
  const [imageUrl, setImageUrl] = useState(product.imageUrl)
  const inputEl = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  useEffect(() => {
    if (subCount || gift) setName(`${+subCount > 1 ? subCount + '×' : ''}${state.packs.find(p => p.id === subPackId)?.name}${withGift ? '+' + gift : ''}`)
  }, [subCount, gift, state.packs, withGift, subPackId])

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
      const subPackInfo = state.packs.find(p => p.id === subPackId)!
      if (state.packs.find(p => p.product.id === props.productId && p.name === name)) {
        throw new Error('duplicateName')
      }
      if (+subCount === 0 || +subCount !== Math.floor(+subCount)){
        throw new Error('invalidCount')
      }
      if (!withGift && +subCount === 1) {
        throw new Error('invalidCountWithoutGift')
      }
      const stores = [{
        storeId, 
        price: +price, 
        isRetail: state.stores.find(s => s.id === storeId)!.type === 's', 
        isActive: true,
        time: new Date()
      }]
      const pack = {
        product,
        name,
        stores,
        subPackId,
        subCount: +subCount,
        unitsCount: +subCount * subPackInfo.unitsCount,
        byWeight: subPackInfo.byWeight,
        isActive: true,
        withGift,
        gift,
        forSale,
        lastTrans: new Date()
      }
      addPack(pack, product, state.users, state.packRequests, packRequest, image, subPackInfo)
      showMessage(labels.addSuccess)
      if (packRequest) f7.views.current.router.navigate('/home/')
      else f7.views.current.router.back()
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  return (
    <Page>
      <Navbar title={`${labels.addGroup} ${product.name}`} backLink={labels.back} />
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
        <ListItem
          title={labels.pack}
          smartSelect
          disabled={!!packRequest}
          // @ts-ignore
          smartSelectParams={{
            // el: "#subPacks", 
            openIn: "popup",
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close
          }}
        >
          <select name="subPackId" value={subPackId} onChange={e => setSubPackId(e.target.value)}>
            <option value=""></option>
            {packs.map(p => 
              <option key={p.id} value={p.id}>{p.name}</option>
            )}
          </select>
        </ListItem>
        <ListInput 
          name="subCount" 
          label={labels.count}
          value={subCount}
          clearButton
          type="number" 
          onChange={e => setSubCount(e.target.value)}
          onInputClear={() => setSubCount('')}
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
        {forSale && 
          <ListItem>
            <span>{labels.withGift}</span>
            <Toggle 
              name="withGift" 
              color="green" 
              checked={withGift} 
              onToggleChange={() => setWithGift(s => !s)}
            />
          </ListItem>
        }
        {withGift &&
          <ListInput 
            name="gift" 
            label={labels.gift}
            clearButton
            type="text" 
            value={gift} 
            onChange={e => setGift(e.target.value)}
            onInputClear={() => setGift('')}
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
            onToggleChange={() => setSpecialImage(s => !s)}
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
      {name && subPackId && subCount && (gift || !withGift) &&
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default AddGroup
