import React, { useState, useContext, useMemo, useEffect } from 'react'
import { addCategory, showMessage, showError, getMessage } from '../data/Actions'
import {Page, Navbar, List, ListInput, Fab, Icon } from 'framework7-react';
import { StoreContext } from '../data/Store';


const AddCategory = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const section = useMemo(() => state.sections.find(s => s.id === props.id)
  , [state.sections, props.id]) 
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
        name
      })
      showMessage(props, state.labels.addSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  
  return (
    <Page>
      <Navbar title={`${state.labels.addCategory} ${section.name}`} backLink={state.labels.back} />
      <List form>
        <ListInput 
          name="name" 
          label={state.labels.name}
          floatingLabel 
          type="text" 
          onChange={e => setName(e.target.value)}
        />
      </List>
      {!name ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default AddCategory
