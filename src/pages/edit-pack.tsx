import { useState, useContext, useEffect, ChangeEvent } from 'react'
import { editPack, showMessage, showError, getMessage } from '../data/actions'
import { f7, Page, Navbar, List, ListItem, ListInput, Fab, Icon, Toggle } from 'framework7-react'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'

type Props = {
  id: string
}
const EditPack = (props: Props) => {
  const { state } = useContext(StateContext)
  const [error, setError] = useState('')
  const [pack] = useState(() => state.packs.find(p => p.id === props.id)!)
  const [name, setName] = useState(pack.name)
  const [typeUnits, setTypeUnits] = useState(pack.typeUnits)
  const [byWeight, setByWeight] = useState(pack.byWeight)
  const [hasChanged, setHasChanged] = useState(false)
  const [specialImage, setSpecialImage] = useState(pack.specialImage)
  const [image, setImage] = useState<File>()
  const [imageUrl, setImageUrl] = useState(pack.imageUrl)
  useEffect(() => {
    if (name !== pack.name
    || typeUnits !== pack.typeUnits
    || byWeight !== pack.byWeight
    || specialImage !== pack.specialImage
    || imageUrl !== pack.imageUrl) setHasChanged(true)
    else setHasChanged(false)
  }, [pack, name, typeUnits, byWeight, specialImage, imageUrl])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
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
      if (state.packs.find(p => p.id !== pack.id && p.product.id === props.id && p.name === name)) {
        throw new Error('duplicateName')
      }
      const newPack = {
        ...pack,
        name,
        typeUnits,
        byWeight,
      }
      editPack(newPack, pack, state.packs, image)
      showMessage(labels.editSuccess)
      f7.views.current.router.back()
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
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
        <ListInput 
          name="unitsCount" 
          label={labels.unitsCount}
          clearButton
          type="number" 
          value={typeUnits} 
          onChange={e => setTypeUnits(e.target.value)}
          onInputClear={() => setTypeUnits(0)}
        />
        <ListItem>
          <span>{labels.byWeight}</span>
          <Toggle 
            name="byWeight" 
            color="green" 
            checked={byWeight} 
            onToggleChange={() => setByWeight(!byWeight)}
          />
        </ListItem>
        <ListItem>
          <span>{labels.specialImage}</span>
          <Toggle 
            name="specialImage" 
            color="green" 
            checked={specialImage} 
            onToggleChange={() => setSpecialImage(!specialImage)}
          />
        </ListItem>
        {specialImage ? 
          <ListInput 
            name="image" 
            label={labels.image} 
            type="file" 
            accept="image/*" 
            onChange={e => handleFileChange(e)}
          />
        : ''}
        <img src={imageUrl} className="img-card" alt={labels.noImage} />
      </List>
      {!name || !typeUnits || !hasChanged ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default EditPack
