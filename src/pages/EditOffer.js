import React, { useState, useContext, useEffect, useMemo } from 'react'
import { editPack, showMessage, showError, getMessage } from '../data/Actions'
import { Page, Navbar, List, ListItem, ListInput, Fab, Icon, BlockTitle, Toggle } from 'framework7-react';
import { StoreContext } from '../data/Store'
import ReLogin from './ReLogin'

const EditOffer = props => {
  const { state, user } = useContext(StoreContext)
  const [error, setError] = useState('')
  const pack = useMemo(() => state.packs.find(p => p.id === props.id)
  , [state.packs, props.id])
  const product = useMemo(() => state.products.find(p => p.id === pack.productId)
  , [state.products, pack])

  const [name, setName] = useState(pack.name)
  const [orderLimit, setOrderLimit] = useState(pack.orderLimit)
  const [offerPackId, setOfferPackId] = useState(pack.offerPackId)
  const [offerQuantity, setOfferQuantity] = useState(pack.offerQuantity)
  const [offerPercent, setOfferPercent] = useState(pack.offerPercent)
  const [bonusPackId, setBonusPackId] = useState(pack.bonusPackId)
  const [bonusQuantity, setBonusQuantity] = useState(pack.bonusQuantity)
  const [bonusPercent, setBonusPercent] = useState(pack.bonusPercent)
  const [closeExpired, setCloseExpired] = useState(pack.closeExpired)
  const packs = useMemo(() => state.packs.filter(p => p.productId === pack.productId && !p.isOffer && !p.byWeight)
  , [state.packs, pack])
  const bonusPacks = useMemo(() => {
    let packs = state.packs.filter(p => p.productId !== props.id && !p.isOffer && !p.byWeight)
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
    if (offerPackId !== pack.offerPackId) return true
    if (offerQuantity !== pack.offerQuantity) return true
    if (offerPercent !== pack.offerPercent) return true
    if (bonusPackId !== pack.bonusPackId) return true
    if (bonusQuantity !== pack.bonusQuantity) return true
    if (bonusPercent !== pack.bonusPercent) return true
    if (closeExpired !== pack.closeExpired) return true
    return false
  }, [pack, name, orderLimit, offerPackId, offerQuantity, offerPercent, bonusPackId, bonusQuantity, bonusPercent, closeExpired])

  useEffect(() => {
    if (error) {
      showError(props, error)
      setError('')
    }
  }, [error, props])
  const handleSubmit = async () => {
    try{
      if (Number(offerPercent) + Number(bonusPercent) !== 100) {
        throw new Error('invalidPercents')
      }
      const offerPackInfo = state.packs.find(p => p.id === offerPackId)
      const newPack = {
        ...pack,
        name,
        offerPackId,
        offerQuantity: Number(offerQuantity),
        unitsCount: Number(offerQuantity) * (offerPackInfo.unitsCount + (offerPackInfo.bonusUnits ?? 0)),
        orderLimit: Number(orderLimit),
        offerPercent: Number(offerPercent),
        bonusPackId,
        bonusQuantity: Number(bonusQuantity),
        bonusPercent: Number(bonusPercent),
        closeExpired
      }
      await editPack(newPack)
      showMessage(props, state.labels.addSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  if (!user) return <ReLogin />
  return (
    <Page>
      <Navbar title={`${state.labels.editOffer} ${product.name}`} backLink={state.labels.back} className="page-title" />
      <List form>
        <ListInput 
          name="name" 
          label={state.labels.name}
          floatingLabel 
          clearButton
          type="text" 
          value={name} 
          onChange={e => setName(e.target.value)}
          onInputClear={() => setName('')}
        />
        <ListItem
          title={state.labels.pack}
          smartSelect
          smartSelectParams={{
            openIn: "popup", 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: state.labels.search,
            popupCloseLinkText: state.labels.close
          }}
        >
          <select name="offerPackId" value={offerPackId} onChange={e => setOfferPackId(e.target.value)}>
            <option value=""></option>
            {packs.map(p => 
              <option key={p.id} value={p.id}>{p.name}</option>
            )}
          </select>
        </ListItem>
        <ListInput 
          name="offerQuantity" 
          label={state.labels.quantity}
          value={offerQuantity}
          clearButton
          floatingLabel 
          type="number" 
          onChange={e => setOfferQuantity(e.target.value)}
          onInputClear={() => setOfferQuantity('')}
        />
        <ListInput 
          name="offerPercent" 
          label={state.labels.percent}
          value={offerPercent}
          clearButton
          floatingLabel 
          type="number" 
          onChange={e => setOfferPercent(e.target.value)}
          onInputClear={() => setOfferPercent('')}
        />
        <ListItem>
          <span>{state.labels.closeExpired}</span>
          <Toggle 
            name="closeExpired" 
            color="green" 
            checked={closeExpired} 
            onToggleChange={() => setCloseExpired(!closeExpired)}
          />
        </ListItem>
        <ListInput 
          name="orderLimit" 
          label={state.labels.packLimit}
          floatingLabel 
          clearButton
          type="number" 
          value={orderLimit} 
          onChange={e => setOrderLimit(e.target.value)}
          onInputClear={() => setOrderLimit('')}
        />
      </List>
      <BlockTitle>
        {state.labels.bonusProduct}
      </BlockTitle>
      <List form>
        <ListItem
          title={state.labels.pack}
          smartSelect
          smartSelectParams={{
            openIn: 'popup', 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: state.labels.search,
            popupCloseLinkText: state.labels.close
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
          label={state.labels.quantity}
          value={bonusQuantity}
          clearButton
          floatingLabel 
          type="number" 
          onChange={e => setBonusQuantity(e.target.value)}
          onInputClear={() => setBonusQuantity('')}
        />
        <ListInput 
          name="bonusPercent" 
          label={state.labels.percent}
          value={bonusPercent}
          clearButton
          floatingLabel 
          type="number" 
          onChange={e => setBonusPercent(e.target.value)}
          onInputClear={() => setBonusPercent('')}
        />
      </List>
      {!name || !offerPackId || !offerQuantity || !offerPercent || !hasChanged ? '' :
        <Fab position="left-top" slot="fixed" color="green" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default EditOffer
