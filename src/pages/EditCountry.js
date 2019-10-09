import React, { useState, useContext, useMemo } from 'react'
import { editCountry, showMessage } from '../data/Actions'
import {Page, Navbar, List, ListInput, Fab, Icon, Toolbar, ListItem, Toggle} from 'framework7-react';
import { StoreContext } from '../data/Store';
import BottomToolbar from './BottomToolbar';


const EditCountry = props => {
  const { state } = useContext(StoreContext)
  const country = useMemo(() => state.countries.find(rec => rec.id === props.id), [state.countries])
  const [name, setName] = useState(country.name)
  const [isActive, setIsActive] = useState(country.isActive || false)
  const handleEdit = () => {
    editCountry({
      id: country.id,
      name,
      isActive
    }).then(() => {
      showMessage(props, 'success', state.labels.editSuccess)
      props.f7router.back()
    })
  }
  return (
    <Page>
      <Navbar title={state.labels.editCountry} backLink={state.labels.back} />
      <List form>
        <ListInput 
          name="name" 
          label={state.labels.name}
          value={name}
          floatingLabel 
          type="text" 
          onChange={(e) => setName(e.target.value)}
        />
        <ListItem>
          <span>{state.labels.isActive}</span>
          <Toggle name="isActive" color="green" checked={isActive} onToggleChange={() => setIsActive(!isActive)}/>
        </ListItem>
      </List>
      {!name || (name === country.name && isActive === country.isActive)
      ? ''
      : <Fab position="left-bottom" slot="fixed" color="green" onClick={() => handleEdit()}>
          <Icon ios="f7:check" aurora="f7:check" md="material:done"></Icon>
        </Fab>
      }
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>

    </Page>
  )
}
export default EditCountry
