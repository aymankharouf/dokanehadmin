import { useState, useContext, useEffect, ChangeEvent, useRef } from 'react'
import { addPack, showMessage, showError, getMessage } from '../data/actions'
import { f7, Page, Navbar, List, ListItem, ListInput, Fab, Icon, Toggle, ListButton } from 'framework7-react'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'

type Props = {
  id: string
}
const AddPack = (props: Props) => {
  const { state } = useContext(StateContext)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [typeUnits, setTypeUnits] = useState(0)
  const [packTypeId, setPackTypeId] = useState('')
  const [unitId, setUnitId] = useState('')
  const [byWeight, setByWeight] = useState(false)
  const [specialImage, setSpecialImage] = useState(false)
  const [image, setImage] = useState<File>()
  const [product] = useState(() => state.products.find(p => p.id === props.id)!)
  const [units] = useState(() => state.units.filter(u => u.type === product.unitType))
  const [imageUrl, setImageUrl] = useState(product.imageUrl)
  const inputEl = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const onUploadClick = () => {
    if (inputEl.current) inputEl.current.click();
  };

  const generateName = () => {
    let suggestedName
    if (packTypeId && unitId && typeUnits) {
      suggestedName = `${state.packTypes.find(t => t.id === packTypeId)!.name} ${typeUnits} ${state.units.find(u => u.id === unitId)!.name}`
      if (!name) setName(suggestedName)
    }
  }

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
      if (state.packs.find(p => p.product.id === props.id && p.name === name)) {
        throw new Error('duplicateName')
      }
      const standardUnits = units.find(u => u.id === unitId)!.factor * typeUnits
      const pack = {
        name,
        product,
        typeUnits,
        standardUnits,
        packTypeId,
        unitId,
        byWeight,
        isOffer: false,
        isArchived: false,
        specialImage
      }
      addPack(pack, product, image)
      showMessage(labels.addSuccess)
      f7.views.current.router.back()
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
        <ListItem 
          title={labels.package}
          smartSelect
          // @ts-ignore
          smartSelectParams={{
            // el: "#types", 
            openIn: "sheet",
            closeOnSelect: true, 
          }}
        >
          <select name="packTypeId" value={packTypeId} onChange={e => setPackTypeId(e.target.value)} onBlur={() => generateName()}>
            <option value=""></option>
            {state.packTypes.map(t => 
              <option key={t.id} value={t.id}>{t.name}</option>
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
          <select name="unitId" value={unitId} onChange={e => setUnitId(e.target.value)} onBlur={() => generateName()}>
            <option value=""></option>
            {units.map(u => 
              <option key={u.id} value={u.id}>{u.name}</option>
            )}
          </select>
        </ListItem>
        <ListInput 
          name="typeUnits" 
          label={labels.unitsCount}
          clearButton
          type="number" 
          value={typeUnits} 
          onChange={e => setTypeUnits(e.target.value)}
          onInputClear={() => setTypeUnits(0)}
          onBlur={() => generateName()}
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
        {specialImage && <>
          <input 
            ref={inputEl}
            type="file" 
            accept="image/*" 
            style={{ display: "none" }}
            onChange={e => handleFileChange(e)}
          />
          <ListButton title={labels.setImage} onClick={onUploadClick} />
        </>
        }
        <img src={imageUrl} className="img-card" alt={labels.noImage} />
      </List>
      {name && packTypeId && unitId && typeUnits &&
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default AddPack
