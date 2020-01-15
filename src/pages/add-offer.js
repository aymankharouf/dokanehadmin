import React, { useState, useContext, useEffect, useMemo } from 'react'
import { addPack, showMessage, showError, getMessage } from '../data/actions'
import { f7, Page, Navbar, List, ListItem, ListInput, Fab, Icon, BlockTitle, Toggle } from 'framework7-react'
import { StoreContext } from '../data/store'
import labels from '../data/labels'

const AddOffer = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [name, setName] = useState('')
  const [orderLimit, setOrderLimit] = useState('')
  const [subPackId, setSubPackId] = useState('')
  const [subQuantity, setSubQuantity] = useState('')
  const [subPercent, setSubPercent] = useState(100)
  const [bonusPackId, setBonusPackId] = useState('')
  const [bonusQuantity, setBonusQuantity] = useState('')
  const [bonusPercent, setBonusPercent] = useState('')
  const [closeExpired, setCloseExpired] = useState(false)
  const product = useMemo(() => state.products.find(p => p.id === props.id)
  , [state.products, props.id])
  const packs = useMemo(() => state.packs.filter(p => p.productId === props.id && !p.subPackId && !p.byWeight)
  , [state.packs, props.id])
  const bonusPacks = useMemo(() => {
    let packs = state.packs.filter(p => p.productId !== props.id && !p.subPackId && !p.byWeight)
    packs = packs.map(p => {
      return {
        id: p.id,
        name: `${p.setErrorproductName} ${p.name}`
      }
    })
    return packs.sort((p1, p2) => p1.name > p2.name ? 1 : -1)
  }, [state.packs, props.id]) 
  const generateName = () => {
    let suggestedName
    if (subPackId && subQuantity) {
      suggestedName = `${subQuantity > 1 ? subQuantity + '×' : ''} ${state.packs.find(p => p.id === subPackId).name}`
      if (!name) setName(suggestedName)
    }
    if (name === suggestedName && bonusPackId && bonusQuantity) {
      const bonusPackInfo = bonusPacks.find(p => p.id === bonusPackId)
      suggestedName += ` + ${bonusQuantity > 1 ? bonusQuantity + '×' : ''} ${bonusPackInfo.name}`
      setName(suggestedName)
    }
  }
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  useEffect(() => {
    if (inprocess) {
      f7.dialog.preloader(labels.inprocess)
    } else {
      f7.dialog.close()
    }
  }, [inprocess])

  const handleSubmit = async () => {
    try{
      if (Number(subPercent) + Number(bonusPercent) !== 100) {
        throw new Error('invalidPercents')
      }
      const subPackInfo = state.packs.find(p => p.id === subPackId)
      const pack = {
        productId: props.id,
        productName: product.name,
        imageUrl: product.imageUrl,
        categoryId: product.categoryId,
        country: product.country,
        trademark: product.trademark,
        tagId: product.tagId,
        sales: product.sales,
        rating: product.rating,
        ratingCount: product.ratingCount,
        name,
        isOffer: true,
        closeExpired,
        subPackId,
        subQuantity: Number(subQuantity),
        subPercent: subPercent / 100,
        unitsCount: Number(subQuantity) * (subPackInfo.unitsCount + (subPackInfo.bonusUnits || 0)),
        isDivided: subPackInfo.isDivided,
        byWeight: subPackInfo.byWeight,
        orderLimit: Number(orderLimit),
        bonusPackId,
        bonusQuantity: Number(bonusQuantity),
        bonusPercent: bonusPercent / 100
      }
      setInprocess(true)
      await addPack(pack)
      setInprocess(false)
      showMessage(labels.addSuccess)
      props.f7router.back()
    } catch(err) {
      setInprocess(false)
			setError(getMessage(props, err))
		}
  }
  return (
    <Page>
      <Navbar title={`${labels.addOffer} ${product.name}`} backLink={labels.back} />
      <List form>
        <ListInput 
          name="name" 
          label={labels.name}
          floatingLabel 
          clearButton
          type="text" 
          value={name} 
          onChange={e => setName(e.target.value)}
          onInputClear={() => setName('')}
        />
        <ListItem
          title={labels.pack}
          smartSelect
          smartSelectParams={{
            openIn: "popup", 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close
          }}
        >
          <select 
            name="subPackId" 
            value={subPackId} 
            onChange={e => setSubPackId(e.target.value)} 
            onBlur={() => generateName()}
          >
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
          floatingLabel 
          type="number" 
          onChange={e => setSubQuantity(e.target.value)}
          onInputClear={() => setSubQuantity('')}
          onBlur={() => generateName()}
        />
        <ListInput 
          name="subPercent" 
          label={labels.percent}
          value={subPercent}
          clearButton
          floatingLabel 
          type="number" 
          onChange={e => setSubPercent(e.target.value)}
          onInputClear={() => setSubPercent('')}
        />
        <ListItem>
          <span>{labels.closeExpired}</span>
          <Toggle 
            name="closeExpired" 
            color="green" 
            checked={closeExpired} 
            onToggleChange={() => setCloseExpired(!closeExpired)}
          />
        </ListItem>
        <ListInput 
          name="orderLimit" 
          label={labels.packLimit}
          floatingLabel 
          clearButton
          type="number" 
          value={orderLimit} 
          onChange={e => setOrderLimit(e.target.value)}
          onInputClear={() => setOrderLimit('')}
        />
      </List>
      <BlockTitle>
        {labels.bonusProduct}
      </BlockTitle>
      <List form>
        <ListItem
          title={labels.pack}
          smartSelect
          smartSelectParams={{
            openIn: 'popup', 
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
          floatingLabel 
          type="number" 
          onChange={e => setBonusQuantity(e.target.value)}
          onInputClear={() => setBonusQuantity('')}
          onBlur={() => generateName()}
        />
        <ListInput 
          name="bonusPercent" 
          label={labels.percent}
          value={bonusPercent}
          clearButton
          floatingLabel 
          type="number" 
          onChange={e => setBonusPercent(e.target.value)}
          onInputClear={() => setBonusPercent('')}
        />
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
