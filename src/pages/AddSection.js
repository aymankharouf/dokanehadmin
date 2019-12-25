import React, { useState, useContext, useEffect } from 'react'
import { addSection, showMessage, showError, getMessage } from '../data/Actions'
import {Page, Navbar, List, ListInput, Fab, Icon, Toolbar } from 'framework7-react';
import { StoreContext } from '../data/Store';
import BottomToolbar from './BottomToolbar';


const AddSection = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  useEffect(() => {
    if (error) {
      showError(props, error)
      setError('')
    }
  }, [error, props])

  const handleSubmit = async () => {
    try{
      await addSection({name})
      showMessage(props, state.labels.addSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  return (
    <Page>
      <Navbar title={state.labels.addSection} backLink={state.labels.back} />
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
      </List>
      {!name ? '' : 
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
export default AddSection
