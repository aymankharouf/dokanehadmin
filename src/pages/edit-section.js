import React, { useState, useContext, useMemo, useEffect } from 'react'
import { editSection, showMessage, showError, getMessage } from '../data/actions'
import { Page, Navbar, List, ListInput, Fab, Icon, Toolbar } from 'framework7-react'
import { StoreContext } from '../data/store'
import BottomToolbar from './bottom-toolbar'
import labels from '../data/labels'


const EditSection = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const section = useMemo(() => state.sections.find(s => s.id === props.id)
  , [state.sections, props.id])
  const [name, setName] = useState(section.name)
  const [ordering, setOrdering] = useState(section.ordering || '')
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])

  const handleEdit = async () => {
    try{
      await editSection({
        id: section.id,
        name,
        ordering
      })
      showMessage(labels.editSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  return (
    <Page>
      <Navbar title={labels.editSection} backLink={labels.back} />
      <List form>
        <ListInput 
          name="name" 
          label={labels.name}
          value={name}
          floatingLabel 
          type="text" 
          onChange={e => setName(e.target.value)}
        />
        <ListInput 
          name="ordering" 
          label={labels.ordering} 
          floatingLabel
          clearButton
          type="number"
          value={ordering}
          onChange={e => setOrdering(e.target.value)}
          onInputClear={() => setOrdering('')}
        />
      </List>
      {!name || !ordering || (name === section.name && ordering === section.ordering) ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleEdit()}>
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
