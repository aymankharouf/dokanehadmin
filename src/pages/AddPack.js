import React, { useState, useContext, useEffect } from 'react'
import { addPack } from '../data/Actions'
import {Page, Navbar, List, ListItem, ListInput, Block, Fab, Icon, Toggle, BlockTitle, Link, Button, Row, Col} from 'framework7-react';
import { StoreContext } from '../data/Store';


const AddPack = props => {
  const { state } = useContext(StoreContext)
  const product = state.products.find(rec => rec.id === props.id)
  const [name, setName] = useState('')
  const [isOffer, setIsOffer] = useState(false)
  const [offerPackId, setOfferPackId] = useState('')
  const offerProductPacks = state.packs.filter(rec => rec.productId === props.id && rec.isOffer === false)
  const [offerQuantity, setOfferQuantity] = useState('')
  const [bonusProductId, setBonusProductId] = useState('')
  const [bonusPackId, setBonusPackId] = useState('')
  const [bonusProductPacks, setBonusProductPacks] = useState([])
  const [bonusQuantity, setBonusQuantity] = useState('')
  const [isBonusFree, setIsBonusFree] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    if (bonusProductId) {
      setBonusProductPacks(state.packs.filter(rec => rec.productId === bonusProductId && rec.isOffer === false))
    } else {
      setBonusProductPacks([])
    }
  }, [bonusProductId])

  const handleSubmit = () => {
    try{
      if (name === '') {
        throw new Error(state.labels.enterName)
      }
      addPack({
        productId: product.id,
        name,
        isOffer,
        offerPackId,
        offerQuantity,
        bonusProductId,
        bonusPackId,
        bonusQuantity,
        isBonusFree
      }).then(() => {
        props.f7router.back()
      })
    } catch (err) {
      setError(err.message)
    }
  }

  const offerPacksOptionsTags = offerProductPacks.map(pack => 
    <option 
      key={pack.id} 
      value={pack.id}
    >
      {pack.name}
    </option>
  )
  const bonusProductsOptionsTags = state.products.map(product => 
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
      {error ? <Block strong className="error">{error}</Block> : null}
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
        <ListItem>
          <span>{state.labels.isOffer}</span>
          <Toggle name="isOffer" color="green" checked={isOffer} onToggleChange={() => setIsOffer(!isOffer)}/>
        </ListItem>
      </List>
      {isOffer ?
        <React.Fragment>
          <List form>
            <ListItem
              title={state.labels.pack}
              smartSelect
              smartSelectParams={{openIn: 'popup', closeOnSelect: true, searchbar: true, searchbarPlaceholder: 'Search pack'}}
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
              smartSelectParams={{openIn: 'popup', closeOnSelect: true, searchbar: true, searchbarPlaceholder: 'Search pack'}}
            >
              <select name="bonusProductId" defaultValue={bonusProductId} onChange={(e) => setBonusProductId(e.target.value)}>
                <option value="" disabled></option>
                {bonusProductsOptionsTags}
              </select>
            </ListItem>
            <ListItem
              title={state.labels.pack}
              smartSelect
              smartSelectParams={{openIn: 'popup', closeOnSelect: true, searchbar: true, searchbarPlaceholder: 'Search pack'}}
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
      : null}
      <Fab position="center-bottom" slot="fixed" text={state.labels.submit} color="green" onClick={() => handleSubmit()}>
        <Icon ios="f7:check" aurora="f7:check" md="material:done"></Icon>
      </Fab>
    </Page>
  )
}
export default AddPack
