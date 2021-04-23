import { useState, useContext, useEffect, ChangeEvent } from 'react'
import { addPack, showMessage, showError, getMessage } from '../data/actions'
import { f7, Page, Navbar, List, ListItem, ListInput, Fab, Icon, Toggle } from 'framework7-react'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'

type Props = {
  id: string
}
const AddPack = (props: Props) => {
  const { state } = useContext(StateContext)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [unitsCount, setUnitsCount] = useState('')
  const [packTypeId, setPackTypeId] = useState('')
  const [unitId, setUnitId] = useState('')
  const [isDivided, setIsDivided] = useState(false)
  const [byWeight, setByWeight] = useState(false)
  const [closeExpired, setCloseExpired] = useState(false)
  const [specialImage, setSpecialImage] = useState(false)
  const [image, setImage] = useState<File>()
  const [product] = useState(() => state.products.find(p => p.id === props.id)!)
  const [imageUrl, setImageUrl] = useState(product.imageUrl)
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  useEffect(() => {
    if (isDivided) {
      setByWeight(true)
    }
  }, [isDivided])
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
      if (state.packs.find(p => p.productId === props.id && p.name === name && p.closeExpired === closeExpired)) {
        throw new Error('duplicateName')
      }
      const pack = {
        productId: product.id!,
        productName: product.name,
        productAlias: product.alias,
        categoryId: product.categoryId,
        countryId: product.countryId,
        sales: product.sales,
        rating: product.rating,
        name,
        unitsCount: Number(unitsCount),
        packTypeId,
        unitId,
        isDivided,
        closeExpired,
        byWeight,
        isOffer: false,
        price: 0,
        forSale: true,
        isArchived: false,
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
          type="text" 
          value={name} 
          onChange={e => setName(e.target.value)}
          onInputClear={() => setName('')}
        />
        <ListItem 
          title={labels.type}
          smartSelect
          id="types"
          smartSelectParams={{
            el: "#types", 
            openIn: "popup",
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close,
            renderPage: undefined
          }}
        >
          <select name="packTypeId" value={packTypeId} onChange={e => setPackTypeId(e.target.value)}>
            <option value=""></option>
            {state.packTypes.map(t => 
              <option key={t.id} value={t.id}>{t.name}</option>
            )}
          </select>
        </ListItem>
        <ListItem 
          title={labels.unit}
          smartSelect
          id="units"
          smartSelectParams={{
            el: "#units", 
            openIn: "popup",
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close,
            renderPage: undefined
          }}
        >
          <select name="unitId" value={unitId} onChange={e => setUnitId(e.target.value)}>
            <option value=""></option>
            {state.units.map(u => 
              <option key={u.id} value={u.id}>{u.name}</option>
            )}
          </select>
        </ListItem>
        <ListInput 
          name="unitsCount" 
          label={labels.unitsCount}
          clearButton
          type="number" 
          value={unitsCount} 
          onChange={e => setUnitsCount(e.target.value)}
          onInputClear={() => setUnitsCount('')}
        />
        <ListItem>
          <span>{labels.isDivided}</span>
          <Toggle 
            name="isDivived" 
            color="green" 
            checked={isDivided} 
            onToggleChange={() => setIsDivided(!isDivided)}
          />
        </ListItem>
        <ListItem>
          <span>{labels.byWeight}</span>
          <Toggle 
            name="byWeight" 
            color="green" 
            checked={byWeight} 
            onToggleChange={() => setByWeight(!byWeight)}
            disabled={isDivided}
          />
        </ListItem>
        <ListItem>
          <span>{labels.closeExpired}</span>
          <Toggle 
            name="closeExpired" 
            color="green" 
            checked={closeExpired} 
            onToggleChange={() => setCloseExpired(!closeExpired)}
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
        {specialImage && <ListInput 
          name="image" 
          label={labels.image} 
          type="file" 
          accept="image/*" 
          onChange={e => handleFileChange(e)}
        />}
        <img src={imageUrl} className="img-card" alt={labels.noImage} />
      </List>
      {name && packTypeId && unitId && unitsCount &&
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default AddPack
