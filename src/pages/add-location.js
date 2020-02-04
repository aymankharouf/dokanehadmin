import React, { useState, useEffect } from 'react'
import { addLocation, showMessage, showError, getMessage } from '../data/actions'
import { f7, Page, Navbar, List, ListInput, Fab, Icon, Toolbar } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import labels from '../data/labels'


const AddLocation = props => {
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [name, setName] = useState('')
  const [fees, setFees] = useState('')
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
        id: Math.random().toString(),
        name,
        fees: fees * 1000
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
          name="deliveryFees" 
          label={labels.deliveryFees}
          floatingLabel 
          clearButton
          type="number" 
          value={fees} 
          onChange={e => setFees(e.target.value)}
          onInputClear={() => setFees('')}
        />
      </List>
      {!name || !fees ? '' :
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
