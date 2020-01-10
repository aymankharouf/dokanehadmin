import React, { useState, useEffect } from 'react'
import { addLocation, showMessage, showError, getMessage } from '../data/actions'
import { f7, Page, Navbar, List, ListInput, Fab, Icon, Toolbar, Toggle, ListItem } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import labels from '../data/labels'


const AddLocation = props => {
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [name, setName] = useState('')
  const [ordering, setOrdering] = useState('')
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
  useEffect(() => {
    if (inprocess) {
      f7.dialog.preloader(labels.inprocess)
    } else {
      f7.dialog.close()
    }
  }, [inprocess])

  const handleSubmit = async () => {
    try{
      setInprocess(true)
      await addLocation({
        name,
        ordering,
        hasDelivery,
        deliveryFees: deliveryFees * 1000
      })
      setInprocess(false)
      showMessage(labels.addSuccess)
      props.f7router.back()
    } catch(err) {
      setInprocess(false)
			setError(getMessage(props, err))
		}
  }
  return (
    <Page>
      <Navbar title={labels.addLocation} backLink={labels.back} />
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
          name="ordering" 
          label={labels.ordering}
          floatingLabel 
          clearButton
          type="number" 
          value={ordering} 
          onChange={e => setOrdering(e.target.value)}
          onInputClear={() => setOrdering('')}
        />
        <ListItem>
          <span>{labels.hasDelivery}</span>
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
            label={labels.deliveryFees}
            floatingLabel 
            clearButton
            type="number" 
            value={deliveryFees} 
            onChange={e => setDeliveryFees(e.target.value)}
            onInputClear={() => setDeliveryFees('')}
          />
          : ''}
      </List>
      {!name || !ordering || (hasDelivery && !deliveryFees) ? '' :
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
