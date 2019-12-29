import React, { useState, useContext, useEffect } from 'react'
import { addLocation, showMessage, showError, getMessage } from '../data/actions'
import {Page, Navbar, List, ListInput, Fab, Icon, Toolbar, Toggle, ListItem } from 'framework7-react'
import { StoreContext } from '../data/store'
import BottomToolbar from './BottomToolbar'
import labels from '../data/labels'


const AddLocation = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [sorting, setSorting] = useState('')
  const [hasDelivery, setHasDelivery] = useState(false)
  const [deliveryFees, setDeliveryFees] = useState('')
  useEffect(() => {
    if (!hasDelivery) setDeliveryFees('')
  }, [hasDelivery])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])

  const handleSubmit = async () => {
    try{
      await addLocation({
        name,
        sorting,
        hasDelivery,
        deliveryFees: deliveryFees * 1000
      })
      showMessage(state.labels.addSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
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
      </List>
      {!name || !sorting || (hasDelivery && !deliveryFees) ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
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
