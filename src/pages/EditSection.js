import React, { useState, useContext, useMemo, useEffect } from 'react'
import { editSection, showMessage, showError, getMessage } from '../data/Actions'
import { Page, Navbar, List, ListInput, Fab, Icon, Toolbar } from 'framework7-react';
import { StoreContext } from '../data/Store';
import BottomToolbar from './BottomToolbar';


const EditSection = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const section = useMemo(() => state.sections.find(s => s.id === props.id)
  , [state.sections, props.id])
  const [name, setName] = useState(section.name)
  useEffect(() => {
    if (error) {
      showError(props, error)
      setError('')
    }
  }, [error, props])

  const handleEdit = async () => {
    try{
      await editSection({
        id: section.id,
        name
      })
      showMessage(props, state.labels.editSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(err, state.labels, props.f7route.route.component.name))
		}
  }
  return (
    <Page>
      <Navbar title={state.labels.editSection} backLink={state.labels.back} />
      <List form>
        <ListInput 
          name="name" 
          label={state.labels.name}
          value={name}
          floatingLabel 
          type="text" 
          onChange={e => setName(e.target.value)}
        />
      </List>
      {!name || (name === section.name) ? '' :
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
export default (EditSection)
