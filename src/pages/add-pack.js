import React, { useState, useContext, useEffect, useMemo } from 'react'
import { addPack, showMessage, showError, getMessage } from '../data/actions'
import { Page, Navbar, List, ListItem, ListInput, Fab, Icon, Toggle } from 'framework7-react'
import { StoreContext } from '../data/store'
import ReLogin from './relogin'
import labels from '../data/labels'

const AddPack = props => {
  const { state, user } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [unitsCount, setUnitsCount] = useState('')
  const [bonusUnits, setBonusUnits] = useState('')
  const [orderLimit, setOrderLimit] = useState('')
  const [isDivided, setIsDivided] = useState(false)
  const [byWeight, setByWeight] = useState(false)
  const product = useMemo(() => state.products.find(p => p.id === props.id)
  , [state.products, props.id])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  useEffect(() => {
    if (isDivided) {
      setByWeight(true)
    }
  }, [isDivided])
  useEffect(() => {
    if (byWeight) {
      setBonusUnits('')
    }
  }, [byWeight])
  const handleSubmit = async () => {
    try{
      await addPack({
        productId: product.id,
        name,
        unitsCount: Number(unitsCount),
        bonusUnits: Number(bonusUnits),
        orderLimit: Number(orderLimit),
        isDivided,
        closeExpired: false,
        byWeight,
        isOffer: false,
        price: 0,
        time: new Date()
      })
      showMessage(labels.addSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  if (!user) return <ReLogin />
  return (
    <Page>
      <Navbar title={`${labels.addPack} ${product.name}`} backLink={labels.back} />
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
        <ListInput 
          name="unitsCount" 
          label={labels.unitsCount}
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
            label={labels.bonusUnits}
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
          label={labels.packLimit}
          floatingLabel 
          clearButton
          type="number" 
          value={orderLimit} 
          onChange={e => setOrderLimit(e.target.value)}
          onInputClear={() => setOrderLimit('')}
        />
        <ListItem>
          <span>{labels.isDivided}</span>
          <Toggle 
            name="isDivived" 
            color="green" 
            checked={isDivided} 
            onToggleChange={() => setIsDivided(!isDivided)}
          />
        </ListItem>
        <ListItem>
          <span>{labels.byWeight}</span>
          <Toggle 
            name="byWeight" 
            color="green" 
            checked={byWeight} 
            onToggleChange={() => setByWeight(!byWeight)}
            disabled={isDivided}
          />
        </ListItem>
      </List>
      {!name || !unitsCount ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default AddPack
