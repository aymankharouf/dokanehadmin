import { useState, useContext, useEffect, ChangeEvent } from 'react'
import { addPack, showMessage, showError, getMessage } from '../data/actions'
import { f7, Page, Navbar, List, ListItem, ListInput, Fab, Icon, BlockTitle, Toggle } from 'framework7-react'
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
  const [subPercent, setSubPercent] = useState(100)
  const [bonusPackId, setBonusPackId] = useState('')
  const [bonusQuantity, setBonusQuantity] = useState(0)
  const [bonusPercent, setBonusPercent] = useState(0)
  const [specialImage, setSpecialImage] = useState(false)
  const [image, setImage] = useState<File>()
  const [product] = useState(() => state.products.find(p => p.id === props.id)!)
  const [packs] = useState(() => {
    const packs = state.packs.filter(p => p.productId === props.id && !p.isOffer && !p.byWeight && p.forSale)
    return packs.map(p => {
      return {
        id: p.id,
        name: `${p.name} ${p.closeExpired ? '(' + labels.closeExpired + ')' : ''}`
      }
    })
  })
  const [imageUrl, setImageUrl] = useState(product.imageUrl)
  const [bonusPacks] = useState(() => {
    const packs = state.packs.filter(p => p.productId !== props.id && !p.isOffer && !p.byWeight && p.forSale)
    const bonusPacks = packs.map(p => {
      return {
        id: p.id,
        name: `${p.productName} ${p.name} ${p.closeExpired ? '(' + labels.closeExpired + ')' : ''}`
      }
    })
    return bonusPacks.sort((p1, p2) => p1.name > p2.name ? 1 : -1)
  })
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
    if (name === suggestedName && bonusPackId && bonusQuantity) {
      const bonusPackInfo = bonusPacks.find(p => p.id === bonusPackId)!
      suggestedName += ` + ${bonusQuantity > 1 ? bonusQuantity + '×' : ''}${bonusPackInfo.name}`
      setName(suggestedName)
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
      const bonusPackInfo = state.packs.find(p => p.id === bonusPackId)
      if (state.packs.find(p => p.productId === props.id && p.name === name && p.closeExpired === subPackInfo.closeExpired)) {
        throw new Error('duplicateName')
      }
      if (Number(subPercent) + Number(bonusPercent) !== 100) {
        throw new Error('invalidPercents')
      }
      if (bonusPackInfo && Number(bonusPercent) === 0) {
        throw new Error('invalidPercents')
      }
      if (!bonusPackInfo && Number(subQuantity) <= 1) {
        throw new Error('invalidQuantity')
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
        isOffer: true,
        subPackId,
        subQuantity: Number(subQuantity),
        subPercent: subPercent / 100,
        unitsCount: subQuantity * (subPackInfo.unitsCount ?? 0),
        subPackName: subPackInfo.name,
        isDivided: subPackInfo.isDivided,
        byWeight: subPackInfo.byWeight,
        closeExpired: subPackInfo.closeExpired,
        bonusPackId,
        bonusProductName: bonusPackInfo?.productName || '',
        bonusPackName: bonusPackInfo?.name || '',
        bonusQuantity: Number(bonusQuantity),
        bonusPercent: bonusPercent / 100,
        price: 0,
        forSale: true,
        isArchived: false,
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
        <ListInput 
          name="subPercent" 
          label={labels.percent}
          value={subPercent}
          clearButton
          type="number" 
          onChange={e => setSubPercent(e.target.value)}
          onInputClear={() => setSubPercent(0)}
        />
      </List>
      <BlockTitle>
        {labels.bonusProduct}
      </BlockTitle>
      <List form inlineLabels>
        <ListItem
          title={labels.pack}
          smartSelect
          id="bonusPacks"
          smartSelectParams={{
            el: '#bonusPacks', 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close
          }}
        >
          <select name="bonusPackId" value={bonusPackId} onChange={e => setBonusPackId(e.target.value)} onBlur={() => generateName()}>
            <option value=""></option>
            {bonusPacks.map(p => 
              <option key={p.id} value={p.id}>{p.name}</option>
            )}
          </select>
        </ListItem>
        <ListInput 
          name="bonusQuantity" 
          label={labels.quantity}
          value={bonusQuantity}
          clearButton
          type="number" 
          onChange={e => setBonusQuantity(e.target.value)}
          onInputClear={() => setBonusQuantity(0)}
          onBlur={() => generateName()}
        />
        <ListInput 
          name="bonusPercent" 
          label={labels.percent}
          value={bonusPercent}
          clearButton
          type="number" 
          onChange={e => setBonusPercent(e.target.value)}
          onInputClear={() => setBonusPercent(0)}
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
      {!name || !subPackId || !subQuantity  || !subPercent ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default AddOffer
