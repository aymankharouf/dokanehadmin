import React, { useState, useContext, useEffect } from 'react'
import { addPack, showMessage } from '../data/Actions'
import {Page, Navbar, List, ListItem, ListInput, Block, Fab, Icon, Toggle, BlockTitle, Link, Button, Row, Col} from 'framework7-react';
import { StoreContext } from '../data/Store';


const AddPack = props => {
  const { state } = useContext(StoreContext)
  const product = state.products.find(rec => rec.id === props.id)
  const [name, setName] = useState('')
  const [unitsCount, setUnitsCount] = useState('')
  const [isOffer, setIsOffer] = useState(false)
  const [offerPackId, setOfferPackId] = useState('')
  const offerProductPacks = state.packs.filter(rec => rec.productId === props.id && rec.isOffer === false && rec.isActive === true)
  const [offerQuantity, setOfferQuantity] = useState('')
  const [bonusProductId, setBonusProductId] = useState('')
  const [bonusPackId, setBonusPackId] = useState('')
  const [bonusProductPacks, setBonusProductPacks] = useState([])
  const [bonusQuantity, setBonusQuantity] = useState('')
  const [isBonusFree, setIsBonusFree] = useState('')
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
    addPack({
      productId: product.id,
      name,
      unitsCount,
      isOffer,
      offerPackId,
      offerQuantity,
      bonusProductId,
      bonusPackId,
      bonusQuantity,
      isBonusFree,
      isActive: false,
      stores: [],
      time: new Date()
    }).then(() => {
      showMessage(props, 'success', state.labels.addSuccess)
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
      <Navbar title={`${state.labels.addPack} - ${product.name}`} backLink="Back" />
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
      {!name || !unitsCount ? ''
      : <Fab position="left-bottom" slot="fixed" color="green" onClick={() => handleSubmit()}>
          <Icon ios="f7:check" aurora="f7:check" md="material:done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default AddPack
