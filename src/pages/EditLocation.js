import React, { useState, useContext, useMemo, useEffect } from 'react'
import { editLocation, showMessage, showError, getMessage } from '../data/Actions'
import { Page, Navbar, List, ListInput, Fab, Icon, Toolbar, Toggle, ListItem } from 'framework7-react';
import { StoreContext } from '../data/Store';
import BottomToolbar from './BottomToolbar';

const EditLocation = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const location = useMemo(() => state.locations.find(l => l.id === props.id)
  , [state.locations, props.id])
  const [name, setName] = useState(location.name)
  const [sorting, setSorting] = useState(location.sorting)
  const [hasDelivery, setHasDelivery] = useState(location.hasDelivery)
  const [deliveryFees, setDeliveryFees] = useState((location.deliveryFees / 1000).toFixed(3))
  const [urgentDeliveryFees, setUrgentDeliveryFees] = useState((location.urgentDeliveryFees / 1000).toFixed(3))
  const hasChanged = useMemo(() => {
    if (name !== location.name) return true
    if (sorting !== location.sorting) return true
    if (hasDelivery !== location.hasDelivery) return true
    if (parseInt(deliveryFees * 1000) !== location.deliveryFees) return true
    if (parseInt(urgentDeliveryFees * 1000) !== location.urgentDeliveryFees) return true
    return false
  }, [location, name, sorting, hasDelivery, deliveryFees, urgentDeliveryFees])
  useEffect(() => {
    if (!hasDelivery) setDeliveryFees('')
  }, [hasDelivery])
  useEffect(() => {
    if (error) {
      showError(props, error)
      setError('')
    }
  }, [error, props])

  const handleEdit = async () => {
    try{
      await editLocation({
        id: location.id,
        name,
        sorting,
        hasDelivery,
        deliveryFees: parseInt(deliveryFees * 1000),
        urgentDeliveryFees: parseInt(urgentDeliveryFees * 1000)
      })
      showMessage(props, state.labels.editSuccess)
      props.f7router.back()  
    } catch(err) {
			setError(getMessage(err, state.labels, props.f7route.route.component.name))
		}
  }
  return (
    <Page>
      <Navbar title={state.labels.editLocation} backLink={state.labels.back} />
      <List form>
        <ListInput 
          name="name" 
          label={state.labels.name}
          value={name}
          floatingLabel 
          clearButton
          type="text" 
          onChange={e => setName(e.target.value)}
          onInputClear={() => setName('')}
        />
        <ListInput 
          name="sorting" 
          label={state.labels.sorting}
          floatingLabel 
          clearButton
          type="number" 
          value={sorting} 
          onChange={e => setSorting(e.target.value)}
          onInputClear={() => setSorting('')}
        />
        <ListItem>
          <span>{state.labels.hasDelivery}</span>
          <Toggle 
            name="hasDelivery" 
            color="green" 
            checked={hasDelivery} 
            onToggleChange={() => setHasDelivery(!hasDelivery)}
          />
        </ListItem>
        {hasDelivery ? 
          <ListInput 
            name="deliveryFees" 
            label={state.labels.deliveryFees}
            floatingLabel 
            clearButton
            type="number" 
            value={deliveryFees} 
            onChange={e => setDeliveryFees(e.target.value)}
            onInputClear={() => setDeliveryFees('')}
          />
        : ''}
        {hasDelivery ?
          <ListInput 
            name="urgentDeliveryFees" 
            label={state.labels.urgentDeliveryFees}
            floatingLabel 
            clearButton
            type="number" 
            value={urgentDeliveryFees} 
            onChange={e => setUrgentDeliveryFees(e.target.value)}
            onInputClear={() => setUrgentDeliveryFees('')}
          />
        : ''}
      </List>
      {!name || (hasDelivery && (!deliveryFees || !urgentDeliveryFees)) || !hasChanged ? '' :
        <Fab position="left-top" slot="fixed" color="green" onClick={() => handleEdit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>

    </Page>
  )
}
export default EditLocation
