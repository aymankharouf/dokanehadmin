import React, { useState, useContext, useMemo } from 'react'
import { editCategory, showMessage } from '../data/Actions'
import { Page, Navbar, List, ListInput, Fab, Icon, Toolbar, ListItem } from 'framework7-react';
import { StoreContext } from '../data/Store';
import BottomToolbar from './BottomToolbar';


const EditCategory = props => {
  const { state } = useContext(StoreContext)
  const category = useMemo(() => state.categories.find(rec => rec.id === props.id)
  , [state.categories, props.id])
  const [name, setName] = useState(category.name)
  const [unitType, setUnitType] = useState(category.unitType || '')
  const handleEdit = () => {
    editCategory({
      id: category.id,
      name,
      unitType
    }).then(() => {
      showMessage(props, 'success', state.labels.editSuccess)
      props.f7router.back()
    })
  }
  const unitTypesTags = useMemo(() => state.unitTypes.map(rec => 
    <option key={rec.id} value={rec.id}>{rec.name}</option>
  ), [state.unitTypes])
  return (
    <Page>
      <Navbar title={state.labels.editCategory} backLink={state.labels.back} />
      <List form>
        <ListInput 
          name="name" 
          label={state.labels.name}
          value={name}
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
            <option value=""></option>
            {unitTypesTags}
          </select>
        </ListItem>
      </List>
      {!name || !unitType || (name === category.name && unitType === category.unitType)
      ? ''
      : <Fab position="left-top" slot="fixed" color="green" onClick={() => handleEdit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>

    </Page>
  )
}
export default EditCategory