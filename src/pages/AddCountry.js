import React, { useState, useContext } from 'react'
import { addCountry, showMessage } from '../data/Actions'
import {Page, Navbar, List, ListInput, Fab, Icon, Toolbar} from 'framework7-react';
import { StoreContext } from '../data/Store';
import BottomToolbar from './BottomToolbar';


const AddCountry = props => {
  const { state } = useContext(StoreContext)
  const [name, setName] = useState('')
  const handleSubmit = () => {
    addCountry({
      name,
      isActive: false
    }).then(() => {
      showMessage(props, 'success', state.labels.addSuccess)
      props.f7router.back()
    })
  }
  return (
    <Page>
      <Navbar title={state.labels.addCountry} backLink='Back' />
      <List form>
        <ListInput 
          name="name" 
          label={state.labels.name} 
          floatingLabel 
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </List>
      {!name ? ''
      : <Fab position="left-bottom" slot="fixed" color="green" onClick={() => handleSubmit()}>
          <Icon ios="f7:check" aurora="f7:check" md="material:done"></Icon>
        </Fab>
      }
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}
export default AddCountry
