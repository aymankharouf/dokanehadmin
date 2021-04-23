import { useState, useContext, useEffect, ChangeEvent } from 'react'
import { editPack, showMessage, showError, getMessage } from '../data/actions'
import { f7, Page, Navbar, List, ListItem, ListInput, Fab, Icon, Toggle } from 'framework7-react'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'

type Props = {
  id: string
}
const EditOffer = (props: Props) => {
  const { state } = useContext(StateContext)
  const [error, setError] = useState('')
  const [pack] = useState(() => state.packs.find(p => p.id === props.id)!)
  const [name, setName] = useState(pack.name)
  const [subPackId, setSubPackId] = useState(pack.subPackId)
  const [subQuantity, setSubQuantity] = useState(pack.subQuantity)
  const [hasChanged, setHasChanged] = useState(false)
  const [specialImage, setSpecialImage] = useState(pack.specialImage)
  const [image, setImage] = useState<File>()
  const [imageUrl, setImageUrl] = useState(pack.imageUrl)
  const [packs] = useState(() => {
    const packs = state.packs.filter(p => p.productId === pack.productId && !p.isOffer && !p.byWeight)
    return packs.map(p => {
      return {
        id: p.id,
        name: `${p.name} ${p.closeExpired ? '(' + labels.closeExpired + ')' : ''}`
      }
    })
  })
  useEffect(() => {
    if (name !== pack.name
    || subPackId !== pack.subPackId
    || subQuantity !== pack.subQuantity
    || specialImage !== pack.specialImage
    || imageUrl !== pack.imageUrl) setHasChanged(true)
    else setHasChanged(false)
  }, [pack, name, subPackId, subQuantity, specialImage, imageUrl])
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
      const subPackInfo = state.packs.find(p => p.id === subPackId)!
      if (state.packs.find(p => p.id !== pack.id && p.productId === props.id && p.name === name && p.closeExpired === subPackInfo.closeExpired)) {
        throw new Error('duplicateName')
      }
      if (Number(subQuantity) <= 1) {
        throw new Error('invalidQuantity')
      }
      const newPack = {
        ...pack,
        name,
        subPackId,
        subQuantity: Number(subQuantity),
        unitsCount: (subQuantity ?? 0) * (subPackInfo.unitsCount ?? 0),
        subPackName: subPackInfo.name,
        isDivided: subPackInfo.isDivided,
        byWeight: subPackInfo.byWeight,
        closeExpired: subPackInfo.closeExpired,
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
      <Navbar title={`${labels.editOffer} ${pack.productName}`} backLink={labels.back} />
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
        <ListItem
          title={labels.pack}
          smartSelect
          id="subPacks"
          smartSelectParams={{
            el: '#subPacks', 
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
          name="subQuantity" 
          label={labels.quantity}
          value={subQuantity}
          clearButton
          type="number" 
          onChange={e => setSubQuantity(e.target.value)}
          onInputClear={() => setSubQuantity(0)}
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
          <ListInput 
            name="image" 
            label={labels.image} 
            type="file" 
            accept="image/*" 
            onChange={e => handleFileChange(e)}
          />
        }
        <img src={imageUrl} className="img-card" alt={labels.noImage} />
      </List>
      {name && subPackId && subQuantity && hasChanged &&
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default EditOffer
