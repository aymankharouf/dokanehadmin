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
  const [hasDelivery, setHasDelivery] = useState(location.hasDelivery)
  const [deliveryFees, setDeliveryFees] = useState(location.deliveryFees)
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
        hasDelivery,
        deliveryFees: parseInt(deliveryFees * 1000)
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
      </List>
      {!name || (hasDelivery && deliveryFees === '') || (name === location.name && hasDelivery === location.hasDelivery && parseInt(deliveryFees * 1000) === location.deliveryFees) ? '' :
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
