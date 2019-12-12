import React, { useState, useContext, useMemo, useEffect } from 'react'
import { addCategory, showMessage, showError, getMessage } from '../data/Actions'
import {Page, Navbar, List, ListInput, Fab, Icon, ListItem } from 'framework7-react';
import { StoreContext } from '../data/Store';


const AddCategory = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [unitType, setUnitType] = useState('')
  const section = useMemo(() => state.sections.find(s => s.id === props.id)
  , [state.sections, props.id]) 
  const unitTypes = useMemo(() => [...state.unitTypes].sort((t1, t2) => t1.name > t2.name ? 1 : -1)
  , [state.unitTypes])
  useEffect(() => {
    if (error) {
      showError(props, error)
      setError('')
    }
  }, [error, props])

  const handleSubmit = async () => {
    try{
      await addCategory({
        sectionId: props.id,
        name,
        unitType
      })
      showMessage(props, state.labels.addSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(err, state.labels, props.f7route.route.component.name))
		}
  }
  
  return (
    <Page>
      <Navbar title={`${state.labels.addCategory} - ${section.name}`} backLink={state.labels.back} />
      <List form>
        <ListInput 
          name="name" 
          label={state.labels.name}
          floatingLabel 
          type="text" 
          onChange={e => setName(e.target.value)}
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
          <select name='unitType' value={unitType} onChange={e => setUnitType(e.target.value)}>
            <option value=""></option>
            {unitTypes.map(t => 
              <option key={t.id} value={t.id}>{t.name}</option>
            )}
          </select>
        </ListItem>
      </List>
      {!name || !unitType ? '' :
        <Fab position="left-top" slot="fixed" color="green" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default AddCategory
