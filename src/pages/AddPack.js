import React, { useState, useContext, useEffect, useMemo } from 'react'
import { addPack, showMessage, showError, getMessage } from '../data/Actions'
import { Page, Navbar, List, ListItem, ListInput, Fab, Icon, Toggle, BlockTitle } from 'framework7-react';
import { StoreContext } from '../data/Store'
import ReLogin from './ReLogin'

const AddPack = props => {
  const { state, user } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [unitsCount, setUnitsCount] = useState('')
  const [orderLimit, setOrderLimit] = useState('')
  const [isOffer, setIsOffer] = useState(false)
  const [isDivided, setIsDivided] = useState(false)
  const [byWeight, setByWeight] = useState(false)
  const [offerPackId, setOfferPackId] = useState('')
  const [offerQuantity, setOfferQuantity] = useState('')
  const [bonusProductId, setBonusProductId] = useState('')
  const [bonusPackId, setBonusPackId] = useState('')
  const [bonusProductPacks, setBonusProductPacks] = useState([])
  const [bonusQuantity, setBonusQuantity] = useState('')
  const [isBonusFree, setIsBonusFree] = useState(false)
  const product = useMemo(() => state.products.find(p => p.id === props.id)
  , [state.products, props.id])
  const offerPacks = useMemo(() => state.packs.filter(p => p.productId === props.id && !p.isOffer && !p.byWeight)
  , [state.packs, props.id])
  const bonusProducts = useMemo(() => [...state.products].sort((p1, p2) => p1.name > p2.name ? 1 : -1)
  , [state.products]) 
  useEffect(() => {
    if (bonusProductId) {
      setBonusProductPacks(state.packs.filter(p => p.productId === bonusProductId && !p.isOffer && !p.byWeight))
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
      setIsBonusFree(false)
    }
  }, [isOffer])
  useEffect(() => {
    if (error) {
      showError(props, error)
      setError('')
    }
  }, [error, props])
  useEffect(() => {
    if (isDivided) {
      setIsOffer(false)
      setByWeight(true)
    }
  }, [isDivided])
  const handleSubmit = async () => {
    try{
      await addPack({
        productId: product.id,
        name,
        unitsCount: parseInt(unitsCount),
        isDivided,
        byWeight,
        isOffer,
        offerPackId,
        offerQuantity: parseInt(offerQuantity),
        bonusProductId,
        bonusPackId,
        bonusQuantity: parseInt(bonusQuantity),
        isBonusFree,
        price: 0,
        orderLimit: parseInt(orderLimit),
        time: new Date()
      })
      showMessage(props, state.labels.addSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(err, state.labels, props.f7route.route.component.name))
		}
  }
  if (!user) return <ReLogin />
  return (
    <Page>
      <Navbar title={`${state.labels.addPack} - ${product.name}`} backLink={state.labels.back} />
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
        <ListInput 
          name="unitsCount" 
          label={state.labels.unitsCount}
          floatingLabel 
          clearButton
          type="number" 
          value={unitsCount} 
          onChange={e => setUnitsCount(e.target.value)}
          onInputClear={() => setUnitsCount('')}
        />
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
        <ListItem>
          <span>{state.labels.isDivided}</span>
          <Toggle 
            name="isDivived" 
            color="green" 
            checked={isDivided} 
            onToggleChange={() => setIsDivided(!isDivided)}
          />
        </ListItem>
        <ListItem>
          <span>{state.labels.byWeight}</span>
          <Toggle 
            name="byWeight" 
            color="green" 
            checked={byWeight} 
            onToggleChange={() => setByWeight(!byWeight)}
          />
        </ListItem>
        {isDivided || byWeight ? '' :
          <ListItem>
            <span>{state.labels.isOffer}</span>
            <Toggle 
              name="isOffer" 
              color="green" 
              checked={isOffer} 
              onToggleChange={() => setIsOffer(!isOffer)}
            />
          </ListItem>      
        }
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
                  <option key={p.id} value={p.id}>{p.name}</option>
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
              <select name="bonusPackId" defaultValue={bonusPackId} onChange={e => setBonusPackId(e.target.value)}>
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
      {!name || !unitsCount ? '' :
        <Fab position="left-top" slot="fixed" color="green" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default AddPack
