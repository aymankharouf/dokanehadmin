import React, { useState, useEffect } from 'react'
import { addTrademark, showMessage, showError, getMessage } from '../data/actions'
import {Page, Navbar, List, ListInput, Fab, Icon, Toolbar } from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import labels from '../data/labels'


const AddTrademark = props => {
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleSubmit = async () => {
    try{
      await addTrademark({name})
      showMessage(labels.addSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  return (
    <Page>
      <Navbar title={labels.addTrademark} backLink={labels.back} />
      <List form>
        <ListInput 
          name="name" 
          label={labels.name}
          floatingLabel 
          type="text" 
          onChange={e => setName(e.target.value)}
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
export default AddTrademark
