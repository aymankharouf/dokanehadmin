import React, { useState, useContext, useEffect } from 'react'
import { editLocation, showMessage, showError, getMessage } from '../data/actions'
import { f7, Page, Navbar, List, ListInput, Fab, Icon, Toolbar } from 'framework7-react'
import { StoreContext } from '../data/store'
import BottomToolbar from './bottom-toolbar'
import labels from '../data/labels'

const EditLocation = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [location] = useState(() => {
    const locations = state.lookups.find(l => l.id === 'l').values
    return locations.find(l => l.id === props.id)
  })
  const [name, setName] = useState(location.name)
  const [fees, setFees] = useState((location.fees / 1000).toFixed(3))
  const [hasChanged, setHasChanged] = useState(false)
  useEffect(() => {
    if (name !== location.name
    || fees * 1000 !== location.fees) setHasChanged(true)
    else setHasChanged(false)
  }, [location, name, fees])
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
      const newLocation = {
        ...location,
        name,
        fees: fees * 1000
      }
      setInprocess(true)
      await editLocation(newLocation, location.fees, state.lookups, state.customers)
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
        <ListInput 
          name="fees" 
          label={labels.fees}
          floatingLabel 
          clearButton
          type="number" 
          value={fees} 
          onChange={e => setFees(e.target.value)}
          onInputClear={() => setFees('')}
        />
      </List>
      {!name || !fees || !hasChanged ? '' :
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
