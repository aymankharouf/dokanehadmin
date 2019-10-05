import React, { useState, useContext, useEffect } from 'react'
import { editPack, showMessage } from '../data/Actions'
import {Page, Navbar, List, ListItem, ListInput, Block, Fab, Icon, Toggle, BlockTitle, Row, Col, Button} from 'framework7-react';
import { StoreContext } from '../data/Store';


const EditPack = props => {
  const { state } = useContext(StoreContext)
  const pack = state.packs.find(rec => rec.id === props.id)
  const product = state.products.find(rec => rec.id === pack.productId)
  const [name, setName] = useState(pack.name)
  const [unitsCount, setUnitsCount] = useState(pack.unitsCount)
  const [isActive, setIsActive] = useState(pack.isActive)
  const [isOffer, setIsOffer] = useState(pack.isOffer)
  const [offerPackId, setOfferPackId] = useState(pack.offerPackId)
  const offerProductPacks = state.packs.filter(rec => rec.productId === props.id && rec.isOffer === false && rec.isActive === true)
  const [offerQuantity, setOfferQuantity] = useState(pack.offerQuantity)
  const [bonusProductId, setBonusProductId] = useState(pack.bonusProductId)
  const [bonusPackId, setBonusPackId] = useState(pack.bonusPackId)
  const [bonusProductPacks, setBonusProductPacks] = useState([])
  const [bonusQuantity, setBonusQuantity] = useState(pack.bonusQuantity)
  const [isBonusFree, setIsBonusFree] = useState(pack.isBonusFree)
  const [error, setError] = useState('')
  useEffect(() => {
    if (bonusProductId) {
      setBonusProductPacks(state.packs.filter(rec => rec.productId === bonusProductId && rec.isOffer === false && rec.isActive === true))
    } else {
      setBonusProductPacks([])
    }
  }, [bonusProductId])
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
      isActive,
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
  const offerPacksOptionsTags = offerProductPacks.map(pack => 
    <option 
      key={pack.id} 
      value={pack.id}
    >
      {pack.name}
    </option>
  )
  let products = state.products.filter(rec => rec.isActive === true)
  products.sort((product1, product2) => product1.name > product2.name ? 1 : -1)
  const bonusProductsOptionsTags = products.map(product => 
    <option 
      key={product.id} 
      value={product.id}
    >
      {product.name}
    </option>
  )
  const bonusPacksOptionsTags = bonusProductPacks.map(pack => 
    <option 
      key={pack.id} 
      value={pack.id}
    >
      {pack.name}
    </option>
  )
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
          <span>{state.labels.isActive}</span>
          <Toggle 
            name="isActive" 
            color="green" 
            checked={isActive} 
            onToggleChange={() => setIsActive(!isActive)}
          />
        </ListItem>
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
                <option value="" disabled></option>
                {offerPacksOptionsTags}
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
              <Toggle name="isBonusFree" color="green" checked={isBonusFree} onToggleChange={() => setIsBonusFree(!isBonusFree)}/>
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
              <select name="bonusProductId" defaultValue={bonusProductId} onChange={(e) => setBonusProductId(e.target.value)}>
                <option value="" disabled></option>
                {bonusProductsOptionsTags}
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
                <option value="" disabled></option>
                {bonusPacksOptionsTags}
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
      {!name || !unitsCount || (isOffer && (!offerPackId || !offerQuantity)) || (name === pack.name && unitsCount === pack.unitsCount && isActive === pack.isActive && isOffer === pack.isOffer && offerPackId === pack.offerPackId && offerQuantity === pack.offerQuantity && bonusProductId === pack.bonusProductId && bonusPackId === pack.bonusPackId && bonusQuantity === pack.bonusQuantity && isBonusFree === pack.isBonusFree) ? ''
      : <Fab position="left-bottom" slot="fixed" color="green" onClick={() => handleSubmit()}>
          <Icon ios="f7:check" aurora="f7:check" md="material:done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default React.memo(EditPack)
