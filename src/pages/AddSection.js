import React, { useState, useContext } from 'react'
import { addSection, showMessage } from '../data/Actions'
import {Page, Navbar, List, ListInput, ListButton} from 'framework7-react';
import { StoreContext } from '../data/Store';


const AddSection = props => {
  const { state } = useContext(StoreContext)
  const [name, setName] = useState('')
  const [percent, setPercent] = useState('')
  const handleSubmit = () => {
    addSection({
      name,
      percent,
      isActive: false
    }).then(() => {
      showMessage(props, 'success', state.labels.addSuccess)
      props.f7router.back()
    })
  }
  return (
    <Page loginScreen>
      <Navbar title={state.labels.addSection} backLink={state.labels.back} />
      <List form>
        <ListInput 
          name="name" 
          label={state.labels.name} 
          floatingLabel 
          type="text" 
          onChange={(e) => setName(e.target.value)}
        />
        <ListInput 
          name="percent" 
          label={state.labels.percent}
          floatingLabel 
          type="number" 
          onChange={(e) => setPercent(e.target.value)}
        />
        {!name || !percent ? '' : <ListButton onClick={() => handleSubmit()}>{state.labels.add}</ListButton>}
      </List>
    </Page>
  )
}
export default AddSection
