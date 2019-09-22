import React, { useState, useContext } from 'react'
import { editCategory, showMessage } from '../data/Actions'
import {Page, Navbar, List, ListInput, Fab, Icon, Toolbar, ListItem, Toggle} from 'framework7-react';
import { StoreContext } from '../data/Store';
import BottomToolbar from './BottomToolbar';


const EditCategory = props => {
  const { state } = useContext(StoreContext)
  const category = state.categories.find(rec => rec.id === props.id)
  const [name, setName] = useState(category.name)
  const [isActive, setIsActive] = useState(category.isActive || false)
  const handleEdit = () => {
    editCategory({
      id: category.id,
      name,
      isActive
    }).then(() => {
      showMessage(props, 'success', state.labels.editSuccess)
      props.f7router.back()
    })
  }
  return (
    <Page>
      <Navbar title={state.labels.editCategory} backLink='Back' />
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
      {!name || (name === category.name && isActive === category.isActive)
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
export default React.memo(EditCategory)
