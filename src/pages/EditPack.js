import React, { useState, useContext, useEffect, useMemo } from 'react'
import { editPack, showMessage } from '../data/Actions'
import {Page, Navbar, List, ListItem, ListInput, Fab, Icon, Toggle, BlockTitle } from 'framework7-react';
import { StoreContext } from '../data/Store';


const EditPack = props => {
  const { state } = useContext(StoreContext)
  const pack = useMemo(() => state.packs.find(p => p.id === props.id)
  , [state.packs, props.id])
  const product = useMemo(() => state.products.find(p => p.id === pack.productId)
  , [state.products, pack])
  const [name, setName] = useState(pack.name)
  const [unitsCount, setUnitsCount] = useState(pack.unitsCount)
  const [isOffer, setIsOffer] = useState(pack.isOffer)
  const [offerPackId, setOfferPackId] = useState(pack.offerPackId)
  const [offerQuantity, setOfferQuantity] = useState(pack.offerQuantity)
  const [bonusProductId, setBonusProductId] = useState(pack.bonusProductId)
  const [bonusPackId, setBonusPackId] = useState(pack.bonusPackId)
  const [bonusProductPacks, setBonusProductPacks] = useState([])
  const [bonusQuantity, setBonusQuantity] = useState(pack.bonusQuantity)
  const [isBonusFree, setIsBonusFree] = useState(pack.isBonusFree)
  const offerPacks = useMemo(() => state.packs.filter(p => p.productId === props.id && p.isOffer === false)
  , [state.packs, props.id])
  const bonusProducts = useMemo(() => [...state.products].sort((p1, p2) => p1.name > p2.name ? 1 : -1)
  , [state.products]) 
  useEffect(() => {
    if (bonusProductId) {
      setBonusProductPacks(state.packs.filter(p => p.productId === bonusProductId && p.isOffer === false))
    } else {
      setBonusProductPacks([])
    }
  }, [state.packs, bonusProductId])
  useEffect(() => {
    if (!isOffer) {
      setOfferPackId('')
      setOfferQuantity('')
      setBonusProductId('')
      setBonusPackId('')
      setBonusQuantity('')
      setIsBonusFree('')
    }
  }, [isOffer])

  const handleSubmit = () => {
    const newPack = {
      ...pack,
      name,
      unitsCount,
      isOffer,
      offerPackId,
      offerQuantity,
      bonusProductId,
      bonusPackId,
      bonusQuantity,
      isBonusFree
    }
    editPack(newPack).then(() => {
      showMessage(props, 'success', state.labels.editSuccess)
      props.f7router.back()
    })
  }
  return (
    <Page>
      <Navbar title={`${state.labels.editPack} - ${product.name} ${pack.name}`} backLink={state.labels.back} />
      <List form>
        <ListInput 
          name="name" 
          label={state.labels.name}
          floatingLabel 
          clearButton
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          onInputClear={() => setName('')}
        />
        <ListInput 
          name="unitsCount" 
          label={state.labels.unitsCount}
          floatingLabel 
          clearButton
          type="number" 
          value={unitsCount} 
          onChange={(e) => setUnitsCount(e.target.value)}
          onInputClear={() => setUnitsCount('')}
        />
        <ListItem>
          <span>{state.labels.isOffer}</span>
          <Toggle 
            name="isOffer" 
            color="green" 
            checked={isOffer} 
            onToggleChange={() => setIsOffer(!isOffer)}
          />
        </ListItem>
      </List>
      {isOffer ?
        <React.Fragment>
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
              <select name="packId" defaultValue={offerPackId} onChange={e => setOfferPackId(e.target.value)}>
                <option value=""></option>
                {offerPacks.map(p => 
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
          </List>
          <BlockTitle>
            {state.labels.bonusProduct}
          </BlockTitle>
          <List>
            <ListItem>
              <span>{state.labels.isBonusFree}</span>
              <Toggle 
              name="isBonusFree" 
              color="green" 
              checked={isBonusFree} 
              onToggleChange={() => setIsBonusFree(!isBonusFree)}
            />
            </ListItem>
            <ListItem
              title={state.labels.product}
              smartSelect
              smartSelectParams={{
                openIn: 'popup', 
                closeOnSelect: true, 
                searchbar: true, 
                searchbarPlaceholder: state.labels.search,
                popupCloseLinkText: state.labels.close
              }}
            >
              <select name="bonusProductId" defaultValue={bonusProductId} onChange={e => setBonusProductId(e.target.value)}>
                <option value=""></option>
                {bonusProducts.map(p => 
                  <option key={p.id} value={p.id}>{parseInt.name}</option>
                )}
              </select>
            </ListItem>
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
              <select name="bonusPackId" defaultValue={bonusPackId} onChange={(e) => setBonusPackId(e.target.value)}>
                <option value=""></option>
                {bonusProductPacks.map(p => 
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
          </List>
        </React.Fragment>
      : ''}
      {!name || !unitsCount || (isOffer && (!offerPackId || !offerQuantity)) || (name === pack.name && unitsCount === pack.unitsCount && isOffer === pack.isOffer && offerPackId === pack.offerPackId && offerQuantity === pack.offerQuantity && bonusProductId === pack.bonusProductId && bonusPackId === pack.bonusPackId && bonusQuantity === pack.bonusQuantity && isBonusFree === pack.isBonusFree) ? ''
      : <Fab position="left-top" slot="fixed" color="green" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default EditPack
