import React, { useState, useContext } from 'react'
import { addCategory, showMessage } from '../data/Actions'
import {Page, Navbar, List, ListInput, Fab, Icon, ListItem } from 'framework7-react';
import { StoreContext } from '../data/Store';


const AddCategory = props => {
  const { state } = useContext(StoreContext)
  const section = state.sections.find(rec => rec.id === props.id)
  const [name, setName] = useState('')
  const [unitType, setUnitType] = useState('')
  const handleSubmit = () => {
    addCategory({
      sectionId: props.id,
      name,
      unitType,
      isActive: false
    }).then(() => {
      showMessage(props, 'success', state.labels.addSuccess)
      props.f7router.back()
    })
  }
  const unitTypesOptionsTags = state.unitTypes.map(rec => <option key={rec.id} value={rec.id}>{rec.name}</option>)
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
        <ListItem
          title={state.labels.unitType}
          smartSelect
          smartSelectParams={{
            openIn: 'popup', 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: state.labels.search,
            popupCloseLinkText: state.labels.close
          }}
        >
          <select name='unitType' value={unitType} onChange={(e) => setUnitType(e.target.value)}>
            <option value="" disabled></option>
            {unitTypesOptionsTags}
          </select>
        </ListItem>
      </List>
      {!name || !unitType ? ''
      : <Fab position="left-bottom" slot="fixed" color="green" onClick={() => handleSubmit()}>
          <Icon ios="f7:check" aurora="f7:check" md="material:done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default AddCategory
