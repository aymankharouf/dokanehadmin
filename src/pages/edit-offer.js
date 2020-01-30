import React, { useState, useContext, useEffect, useMemo, useRef } from 'react'
import { editPack, showMessage, showError, getMessage } from '../data/actions'
import { f7, Page, Navbar, List, ListItem, ListInput, Fab, Icon, BlockTitle, Toggle } from 'framework7-react'
import { StoreContext } from '../data/store'
import labels from '../data/labels'

const EditOffer = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [pack] = useState(() => state.packs.find(p => p.id === props.id))
  const [name, setName] = useState(pack.name)
  const [orderLimit, setOrderLimit] = useState(pack.orderLimit)
  const [subPackId, setSubPackId] = useState(pack.subPackId)
  const [subQuantity, setSubQuantity] = useState(pack.subQuantity)
  const [subPercent, setSubPercent] = useState(pack.subPercent)
  const [bonusPackId, setBonusPackId] = useState(pack.bonusPackId)
  const [bonusQuantity, setBonusQuantity] = useState(pack.bonusQuantity)
  const [bonusPercent, setBonusPercent] = useState(pack.bonusPercent)
  const [closeExpired, setCloseExpired] = useState(pack.closeExpired)
  const [hasChanged, setHasChanged] = useState(false)
  const [packs, setPacks] = useState([])
  useEffect(() => {
    setPacks(() => state.packs)
  }, [state.packs, pack])
  const bonusPacks = useMemo(() => {
    let packs = state.packs.filter(p => p.productId !== props.id && !p.subPackId && !p.byWeight)
    packs = packs.map(p => {
      return {
        id: p.id,
        name: `${p.productName} ${p.name}`
      }
    })
    return packs.sort((p1, p2) => p1.name > p2.name ? 1 : -1)
  }, [state.packs, props.id]) 
  useEffect(() => {
    if (name !== pack.name
    || orderLimit !== pack.orderLimit
    || subPackId !== pack.subPackId
    || subQuantity !== pack.subQuantity
    || subPercent !== pack.subPercent * 100
    || bonusPackId !== pack.bonusPackId
    || bonusQuantity !== pack.bonusQuantity * 100
    || bonusPercent !== pack.bonusPercent
    || closeExpired !== pack.closeExpired) setHasChanged(true)
    else setHasChanged(false)
  }, [pack, name, orderLimit, subPackId, subQuantity, subPercent, bonusPackId, bonusQuantity, bonusPercent, closeExpired])
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
      const newPack = {
        ...pack,
        name,
        subPackId,
        subQuantity: Number(subQuantity),
        unitsCount: subQuantity * (subPackInfo.unitsCount + (subPackInfo.bonusUnits || 0)),
        orderLimit: Number(orderLimit),
        subPercent: subPercent / 100,
        bonusPackId,
        bonusQuantity: Number(bonusQuantity),
        bonusPercent: bonusPercent / 100,
        closeExpired
      }
      setInprocess(true)
      await editPack(newPack)
      setInprocess(false)
      showMessage(labels.editSuccess)
      props.f7router.back()
    } catch(err) {
      setInprocess(false)
			setError(getMessage(props, err))
		}
  }
  return (
    <Page>
      <Navbar title={`${labels.editOffer} ${pack.productName}`} backLink={labels.back} />
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
          <select name="subPackId" defaultValue={pack.subPackId} onChange={e => setSubPackId(e.target.value)}>
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
          <select name="bonusPackId" defaultValue={pack.bonusPackId} onChange={e => setBonusPackId(e.target.value)}>
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
