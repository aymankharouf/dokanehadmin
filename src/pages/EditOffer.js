import React, { useState, useContext, useEffect, useMemo } from 'react'
import { editPack, showMessage, showError, getMessage } from '../data/actions'
import { Page, Navbar, List, ListItem, ListInput, Fab, Icon, BlockTitle, Toggle } from 'framework7-react'
import { StoreContext } from '../data/store'
import ReLogin from './ReLogin'
import labels from '../data/labels'

const EditOffer = props => {
  const { state, user } = useContext(StoreContext)
  const [error, setError] = useState('')
  const pack = useMemo(() => state.packs.find(p => p.id === props.id)
  , [state.packs, props.id])
  const product = useMemo(() => state.products.find(p => p.id === pack.productId)
  , [state.products, pack])

  const [name, setName] = useState(pack.name)
  const [orderLimit, setOrderLimit] = useState(pack.orderLimit)
  const [subPackId, setSubPackId] = useState(pack.subPackId)
  const [subQuantity, setSubQuantity] = useState(pack.subQuantity)
  const [subPercent, setSubPercent] = useState(pack.subPercent)
  const [bonusPackId, setBonusPackId] = useState(pack.bonusPackId)
  const [bonusQuantity, setBonusQuantity] = useState(pack.bonusQuantity)
  const [bonusPercent, setBonusPercent] = useState(pack.bonusPercent)
  const [closeExpired, setCloseExpired] = useState(pack.closeExpired)
  const packs = useMemo(() => state.packs.filter(p => p.productId === pack.productId && !p.subPackId && !p.byWeight)
  , [state.packs, pack])
  const bonusPacks = useMemo(() => {
    let packs = state.packs.filter(p => p.productId !== props.id && !p.subPackId && !p.byWeight)
    packs = packs.map(p => {
      const productInfo = state.products.find(pr => pr.id === p.productId)
      return {
        id: p.id,
        name: `${productInfo.name} ${p.name}`
      }
    })
    return packs.sort((p1, p2) => p1.name > p2.name ? 1 : -1)
  }, [state.packs, state.products, props.id]) 
  const hasChanged = useMemo(() => {
    if (name !== pack.name) return true
    if (orderLimit !== pack.orderLimit) return true
    if (subPackId !== pack.subPackId) return true
    if (subQuantity !== pack.subQuantity) return true
    if (subPercent !== pack.subPercent) return true
    if (bonusPackId !== pack.bonusPackId) return true
    if (bonusQuantity !== pack.bonusQuantity) return true
    if (bonusPercent !== pack.bonusPercent) return true
    if (closeExpired !== pack.closeExpired) return true
    return false
  }, [pack, name, orderLimit, subPackId, subQuantity, subPercent, bonusPackId, bonusQuantity, bonusPercent, closeExpired])

  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleSubmit = async () => {
    try{
      if (Number(subPercent) + Number(bonusPercent) !== 100) {
        throw new Error('invalidPercents')
      }
      const subPackInfo = state.packs.find(p => p.id === subPackId)
      const newPack = {
        ...pack,
        name,
        subPackId,
        subQuantity: Number(subQuantity),
        unitsCount: Number(subQuantity) * (subPackInfo.unitsCount + (subPackInfo.bonusUnits || 0)),
        orderLimit: Number(orderLimit),
        subPercent: Number(subPercent),
        bonusPackId,
        bonusQuantity: Number(bonusQuantity),
        bonusPercent: Number(bonusPercent),
        closeExpired
      }
      await editPack(newPack)
      showMessage(labels.addSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  if (!user) return <ReLogin />
  return (
    <Page>
      <Navbar title={`${labels.editOffer} ${product.name}`} backLink={labels.back} />
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
          floatingLabel 
          type="number" 
          onChange={e => setSubQuantity(e.target.value)}
          onInputClear={() => setSubQuantity('')}
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
          <select name="bonusPackId" value={bonusPackId} onChange={e => setBonusPackId(e.target.value)}>
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
      {!name || !subPackId || !subQuantity || !subPercent || !hasChanged ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default EditOffer
