import React, { useState, useContext, useEffect } from 'react'
import { editLocation, showMessage, showError, getMessage } from '../data/actions'
import { f7, Page, Navbar, List, ListInput, Fab, Icon, Toolbar, Toggle, ListItem } from 'framework7-react'
import { StoreContext } from '../data/store'
import BottomToolbar from './bottom-toolbar'
import labels from '../data/labels'

const EditLocation = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [location] = useState(() => state.locations.find(l => l.id === props.id))
  const [name, setName] = useState(location.name)
  const [hasDelivery, setHasDelivery] = useState(location.hasDelivery)
  const [deliveryFees, setDeliveryFees] = useState((location.deliveryFees / 1000).toFixed(3))
  const [hasChanged, setHasChanged] = useState(false)
  useEffect(() => {
    if (name !== location.name
    || hasDelivery !== location.hasDelivery
    || deliveryFees * 1000 !== location.deliveryFees) setHasChanged(true)
    else setHasChanged(false)
  }, [location, name, hasDelivery, deliveryFees])
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

  const handleEdit = async () => {
    try{
      setInprocess(true)
      await editLocation({
        id: location.id,
        name,
        hasDelivery,
        deliveryFees: deliveryFees * 1000
      })
      setInprocess(false)
      showMessage(labels.editSuccess)
      props.f7router.back()  
    } catch(err) {
      setInprocess(false)
			setError(getMessage(props, err))
		}
  }
  return (
    <Page>
      <Navbar title={labels.editLocation} backLink={labels.back} />
      <List form>
        <ListInput 
          name="name" 
          label={labels.name}
          value={name}
          floatingLabel 
          clearButton
          type="text" 
          onChange={e => setName(e.target.value)}
          onInputClear={() => setName('')}
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
      {!name || (hasDelivery && !deliveryFees) || !hasChanged ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleEdit()}>
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
