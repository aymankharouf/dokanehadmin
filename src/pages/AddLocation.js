import React, { useState, useContext, useEffect } from 'react'
import { addLocation, showMessage, showError, getMessage } from '../data/Actions'
import {Page, Navbar, List, ListInput, Fab, Icon, Toolbar, Toggle, ListItem } from 'framework7-react';
import { StoreContext } from '../data/Store';
import BottomToolbar from './BottomToolbar';


const AddLocation = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [sorting, setSorting] = useState('')
  const [hasDelivery, setHasDelivery] = useState(false)
  const [deliveryFees, setDeliveryFees] = useState('')
  const [urgentDeliveryFees, setUrgentDeliveryFees] = useState('')
  useEffect(() => {
    if (!hasDelivery) setDeliveryFees('')
  }, [hasDelivery])
  useEffect(() => {
    if (error) {
      showError(props, error)
      setError('')
    }
  }, [error, props])

  const handleSubmit = async () => {
    try{
      await addLocation({
        name,
        sorting,
        hasDelivery,
        deliveryFees: deliveryFees * 1000,
        urgentDeliveryFees: urgentDeliveryFees * 1000
      })
      showMessage(props, state.labels.addSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(err, state.labels, props.f7route.route.component.name))
		}
  }
  return (
    <Page>
      <Navbar title={state.labels.addLocation} backLink={state.labels.back} />
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
      {!name || !sorting || (hasDelivery && (!deliveryFees || !urgentDeliveryFees)) ? '' :
        <Fab position="left-top" slot="fixed" color="green" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}
export default AddLocation
