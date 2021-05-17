import {useState, useContext, useEffect, ChangeEvent, useRef} from 'react'
import {editPack, getMessage} from '../data/actions'
import {f7, Page, Navbar, List, ListItem, ListInput, Fab, Icon, Toggle, ListButton} from 'framework7-react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import { useHistory, useLocation, useParams } from 'react-router'
import { useIonToast } from '@ionic/react'

type Params = {
  id: string
}
const EditGroup = () => {
  const {state} = useContext(StateContext)
  const params = useParams<Params>()
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [pack] = useState(() => state.packs.find(p => p.id === params.id)!)
  const [name, setName] = useState(pack.name)
  const [subPackId, setSubPackId] = useState(pack.subPackId)
  const [subCount, setSubCount] = useState(pack.subCount?.toString() || '')
  const [isActive, setIsActive] = useState(pack.isActive)
  const [forSale, setForSale] = useState(pack.forSale)
  const [withGift, setWithGift] = useState(pack.withGift)
  const [gift, setGift] = useState(pack.gift || '')
  const [hasChanged, setHasChanged] = useState(false)
  const [specialImage, setSpecialImage] = useState(!!pack.imageUrl)
  const [image, setImage] = useState<File>()
  const [imageUrl, setImageUrl] = useState(pack.imageUrl)
  const inputEl = useRef<HTMLInputElement | null>(null);
  const [packs] = useState(() => {
    const packs = state.packs.filter(p => p.product.id === pack.product.id && !p.byWeight)
    return packs.map(p => {
      return {
        id: p.id,
        name: p.name
      }
    })
  })
  useEffect(() => {
    if (name !== pack.name
    || isActive !== pack.isActive
    || forSale !== pack.forSale
    || withGift !== pack.withGift
    || gift !== pack.gift
    || subPackId !== pack.subPackId
    || +subCount !== pack.subCount
    || imageUrl !== pack.imageUrl) setHasChanged(true)
    else setHasChanged(false)
  }, [pack, name, subPackId, subCount, isActive, withGift, gift, forSale, imageUrl])
  useEffect(() => {
    if (subCount || gift) setName(`${+subCount > 1 ? subCount + '×' : ''}${state.packs.find(p => p.id === subPackId)?.name}${withGift ? '+' + gift : ''}`)
  }, [subCount, gift, state.packs, withGift, subPackId])
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
      const subPackInfo = state.packs.find(p => p.id === subPackId)!
      if (state.packs.find(p => p.id !== pack.id && p.product.id === params.id && p.name === name)) {
        throw new Error('duplicateName')
      }
      if (+subCount <= 1) {
        throw new Error('invalidCount')
      }
      const newPack = {
        ...pack,
        name,
        subPackId,
        subCount: +subCount,
        unitsCount: +subCount! * subPackInfo.unitsCount!,
        byWeight: subPackInfo.byWeight,
        withGift,
        gift,
        forSale,
        isActive
      }
      editPack(newPack, state.packs, image)
      message(labels.editSuccess, 3000)
      history.goBack()
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return (
    <Page>
      <Navbar title={`${labels.editGroup} ${pack.product.name}`} backLink={labels.back} />
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
        <ListItem>
          <span>{labels.isActive}</span>
          <Toggle 
            name="isActive" 
            color="green" 
            checked={isActive} 
            onToggleChange={() => setIsActive(s => !s)}
          />
        </ListItem>
        <ListItem
          title={labels.pack}
          smartSelect
          // @ts-ignore
          smartSelectParams={{
            // el: '#subPacks', 
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
      {name && subPackId && subCount && (gift || !withGift) && hasChanged &&
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default EditGroup
