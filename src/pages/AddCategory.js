import React, { useState, useContext } from 'react'
import { addCategory, showMessage } from '../data/Actions'
import {Page, Navbar, List, ListInput, Fab, Icon } from 'framework7-react';
import { StoreContext } from '../data/Store';


const AddCategory = props => {
  const { state } = useContext(StoreContext)
  const section = state.sections.find(rec => rec.id === props.id)
  const [name, setName] = useState('')

  const handleSubmit = () => {
    addCategory({
      sectionId: props.id,
      name,
      isActive: false
    }).then(() => {
      showMessage(props, 'success', state.labels.addSuccess)
      props.f7router.back()
    })
  }
  return (
    <Page>
      <Navbar title={`${state.labels.addCategory} - ${section.name}`} backLink='Back' />
      <List form>
        <ListInput 
          name="name" 
          label={state.labels.name}
          floatingLabel 
          type="text" 
          onChange={(e) => setName(e.target.value)}
        />
      </List>
      {!name ? ''
      : <Fab position="left-bottom" slot="fixed" color="green" onClick={() => handleSubmit()}>
          <Icon ios="f7:check" aurora="f7:check" md="material:done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default AddCategory
