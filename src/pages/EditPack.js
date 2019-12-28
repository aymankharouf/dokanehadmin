import React, { useState, useContext, useEffect, useMemo } from 'react'
import { editPack, showMessage, showError, getMessage } from '../data/Actions'
import {Page, Navbar, List, ListItem, ListInput, Fab, Icon, Toggle } from 'framework7-react';
import { StoreContext } from '../data/Store';


const EditPack = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const pack = useMemo(() => state.packs.find(p => p.id === props.id)
  , [state.packs, props.id])
  const product = useMemo(() => state.products.find(p => p.id === pack.productId)
  , [state.products, pack])
  const [name, setName] = useState(pack.name)
  const [unitsCount, setUnitsCount] = useState(pack.unitsCount)
  const [bonusUnits, setBonusUnits] = useState(pack.bonusUnits)
  const [orderLimit, setOrderLimit] = useState(pack.orderLimit)
  const [isDivided, setIsDivided] = useState(pack.isDivided)
  const [byWeight, setByWeight] = useState(pack.byWeight)
  const hasChanged = useMemo(() => {
    if (name !== pack.name) return true
    if (unitsCount !== pack.unitsCount) return true
    if (bonusUnits !== pack.bonusUnits) return true
    if (orderLimit !== pack.orderLimit) return true
    if (isDivided !== pack.isDivided) return true
    if (byWeight !== pack.byWeight) return true
    return false
  }, [pack, name, unitsCount, orderLimit, isDivided, byWeight, bonusUnits])
  useEffect(() => {
    if (isDivided) {
      setByWeight(true)
    }
  }, [isDivided])

  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleSubmit = async () => {
    try{
      const newPack = {
        ...pack,
        name,
        unitsCount: Number(unitsCount),
        bonusUnits: Number(bonusUnits),
        orderLimit: Number(orderLimit),
        isDivided,
        byWeight
      }
      await editPack(newPack)
      showMessage(state.labels.editSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  return (
    <Page>
      <Navbar title={`${state.labels.editPack} ${product.name} ${pack.name}`} backLink={state.labels.back} />
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
        {byWeight ? '' : 
          <ListInput 
            name="bonusUnits" 
            label={state.labels.bonusUnits}
            floatingLabel 
            clearButton
            type="number" 
            value={bonusUnits} 
            onChange={e => setBonusUnits(e.target.value)}
            onInputClear={() => setBonusUnits('')}
          />
        }          
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
      </List>
      {!name || !unitsCount || !hasChanged ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default EditPack
