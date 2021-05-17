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
const EditPack = () => {
  const {state} = useContext(StateContext)
  const params = useParams<Params>()
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [pack] = useState(() => state.packs.find(p => p.id === params.id)!)
  const [name, setName] = useState(pack.name)
  const [unitsCount, setUnitsCount] = useState(pack.unitsCount?.toString())
  const [byWeight, setByWeight] = useState(pack.byWeight)
  const [isActive, setIsActive] = useState(pack.isActive)
  const [hasChanged, setHasChanged] = useState(false)
  const [specialImage, setSpecialImage] = useState(!!pack.imageUrl)
  const [image, setImage] = useState<File>()
  const [imageUrl, setImageUrl] = useState(pack.imageUrl)
  const inputEl = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (name !== pack.name
    || +unitsCount !== pack.unitsCount
    || isActive !== pack.isActive
    || byWeight !== pack.byWeight
    || imageUrl !== pack.imageUrl) setHasChanged(true)
    else setHasChanged(false)
  }, [pack, name, unitsCount, byWeight, isActive, imageUrl])
  useEffect(() => {
    if (byWeight) setUnitsCount('1')
  }, [byWeight])
  const onUploadClick = () => {
    if (inputEl.current) inputEl.current.click();
  };
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    try {
      const files = e.target.files
      if (!files) return
      const filename = files[0].name
      if (filename.lastIndexOf('.') <= 0) {
        throw new Error(labels.invalidFile)
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
      if (state.packs.find(p => p.id !== pack.id && p.product.id === params.id && p.name === name)) {
        throw new Error('duplicateName')
      }
      const newPack = {
        ...pack,
        name,
        unitsCount: +unitsCount,
        byWeight,
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
      <Navbar title={`${labels.editPack} ${pack.product.name}`} backLink={labels.back} />
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
      {name && unitsCount && hasChanged &&
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default EditPack
