import React, { useState, useContext, useMemo, useEffect } from 'react'
import { editCategory, showMessage, showError, getMessage } from '../data/Actions'
import { Page, Navbar, List, ListInput, Fab, Icon, Toolbar, ListItem } from 'framework7-react';
import { StoreContext } from '../data/Store';
import BottomToolbar from './BottomToolbar';


const EditCategory = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const category = useMemo(() => state.categories.find(c => c.id === props.id)
  , [state.categories, props.id])
  const [name, setName] = useState(category.name)
  const [unitType, setUnitType] = useState(category.unitType || '')
  const unitTypes = useMemo(() => [...state.unitTypes].sort((t1, t2) => t1.name > t2.name ? 1 : -1)
  , [state.unitTypes])
  useEffect(() => {
    if (error) {
      showError(props, error)
      setError('')
    }
  }, [error, props])

  const handleEdit = async () => {
    try{
      await editCategory({
        id: category.id,
        name,
        unitType
      })
      showMessage(props, state.labels.editSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(err, state.labels, props.f7route.route.component.name))
		}
  }
  
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
            {unitTypes.map(t => 
              <option key={t.id} value={t.id}>{t.name}</option>
            )}
          </select>
        </ListItem>
      </List>
      {!name || !unitType || (name === category.name && unitType === category.unitType) ? '' :
        <Fab position="left-top" slot="fixed" color="green" onClick={() => handleEdit()}>
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
