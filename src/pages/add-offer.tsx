import { useState, useContext, useEffect, ChangeEvent } from 'react'
import { addPack, showMessage, showError, getMessage } from '../data/actions'
import { f7, Page, Navbar, List, ListItem, ListInput, Fab, Icon, Toggle } from 'framework7-react'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'

type Props = {
  id: string
}
const AddOffer = (props: Props) => {
  const { state } = useContext(StateContext)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [subPackId, setSubPackId] = useState('')
  const [subQuantity, setSubQuantity] = useState(0)
  const [isOffer, setIsOffer] = useState(false)
  const [specialImage, setSpecialImage] = useState(false)
  const [image, setImage] = useState<File>()
  const [product] = useState(() => state.products.find(p => p.id === props.id)!)
  const [packs] = useState(() => {
    const packs = state.packs.filter(p => p.productId === props.id && !p.isOffer && !p.byWeight)
    return packs.map(p => {
      return {
        id: p.id,
        name: p.name
      }
    })
  })
  const [imageUrl, setImageUrl] = useState(product.imageUrl)
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  useEffect(() => {
    setImageUrl(() => state.packs.find(p => p.id === subPackId)?.imageUrl || '')
  }, [state.packs, subPackId])
  const generateName = () => {
    let suggestedName
    if (subPackId && subQuantity) {
      suggestedName = `${subQuantity > 1 ? subQuantity + '×' : ''}${state.packs.find(p => p.id === subPackId)?.name}`
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
      const subPackInfo = state.packs.find(p => p.id === subPackId)!
      if (state.packs.find(p => p.productId === props.id && p.name === name)) {
        throw new Error('duplicateName')
      }
      if (Number(subQuantity) <= 1) {
        throw new Error('invalidQuantity')
      }
      const pack = {
        productId: product.id!,
        productName: product.name,
        productAlias: product.alias,
        categoryId: product.categoryId,
        countryId: product.countryId,
        rating: product.rating,
        name,
        isOffer,
        subPackId,
        subQuantity: Number(subQuantity),
        unitsCount: subQuantity * (subPackInfo.unitsCount ?? 0),
        subPackName: subPackInfo.name,
        byWeight: subPackInfo.byWeight,
        price: 0,
        isArchived: false,
        packTypeId: '0',
        unitId: '0',
        specialImage
      }
      addPack(pack, product, image, subPackInfo)
      showMessage(labels.addSuccess)
      f7.views.current.router.back()
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  return (
    <Page>
      <Navbar title={`${labels.addOffer} ${product.name}`} backLink={labels.back} />
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
            el: "#subPacks", 
            openIn: "popup",
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close
          }}
        >
          <select name="subPackId" value={subPackId} onChange={e => setSubPackId(e.target.value)} onBlur={() => generateName()}>
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
          onBlur={() => generateName()}
        />
        <ListItem>
          <span>{labels.offer}</span>
          <Toggle 
            name="isOffer" 
            color="green" 
            checked={isOffer} 
            onToggleChange={() => setIsOffer(!isOffer)}
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
      {name && subPackId && subQuantity &&
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default AddOffer
