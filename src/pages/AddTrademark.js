import React, { useState, useContext } from 'react'
import { addTrademark, showMessage } from '../data/Actions'
import {Page, Navbar, List, ListInput, Fab, Icon, Toolbar } from 'framework7-react';
import { StoreContext } from '../data/Store';
import BottomToolbar from './BottomToolbar';


const AddTrademark = props => {
  const { state } = useContext(StoreContext)
  const [name, setName] = useState('')
  const handleSubmit = () => {
    addTrademark({
      name,
      isActive: false
    }).then(() => {
      showMessage(props, 'success', state.labels.addSuccess)
      props.f7router.back()
    })
  }
  return (
    <Page>
      <Navbar title={state.labels.addTrademark} backLink={state.labels.back} />
      <List form>
        <ListInput 
          name="name" 
          label={state.labels.name}
          floatingLabel 
          type="text" 
          onChange={(e) => setName(e.target.value)}
        />
      </List>
      {name ? 
        <Fab position="left-top" slot="fixed" color="green" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
        : ''
      }
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>

    </Page>
  )
}
export default AddTrademark
