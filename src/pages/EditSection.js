import React, { useState, useContext } from 'react'
import { editSection, showMessage } from '../data/Actions'
import {Page, Navbar, List, ListInput, Fab, Icon, Toolbar, ListItem, Toggle} from 'framework7-react';
import { StoreContext } from '../data/Store';
import BottomToolbar from './BottomToolbar';


const EditSection = props => {
  const { state } = useContext(StoreContext)
  const section = state.sections.find(rec => rec.id === props.id)
  const [name, setName] = useState(section.name)
  const [percent, setPercent] = useState(section.percent)
  const [isActive, setIsActive] = useState(section.isActive || false)
  const handleEdit = () => {
    editSection({
      id: section.id,
      name,
      percent,
      isActive
    }).then(() => {
      showMessage(props, 'success', state.labels.editSuccess)
      props.f7router.back()
    })
  }
  return (
    <Page>
      <Navbar title={state.labels.editSection} backLink='Back' />
      <List form>
        <ListInput 
          name="name" 
          label={state.labels.name}
          value={name}
          floatingLabel 
          type="text" 
          onChange={(e) => setName(e.target.value)}
        />
        <ListInput 
          name="percent" 
          label={state.labels.percent}
          value={percent}
          floatingLabel 
          type="text" 
          onChange={(e) => setPercent(e.target.value)}
        />
        <ListItem>
          <span>{state.labels.isActive}</span>
          <Toggle name="isActive" color="green" checked={isActive} onToggleChange={() => setIsActive(!isActive)}/>
        </ListItem>

      </List>
      {!name || (name === section.name && percent === section.percent && isActive === section.isActive)
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
export default React.memo(EditSection)
