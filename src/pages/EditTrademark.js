import React, { useState, useContext, useMemo, useEffect } from 'react'
import { editTrademark, showMessage, showError, getMessage } from '../data/Actions'
import { Page, Navbar, List, ListInput, Fab, Icon, Toolbar } from 'framework7-react';
import { StoreContext } from '../data/Store';
import BottomToolbar from './BottomToolbar';


const EditTrademark = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const trademark = useMemo(() => state.trademarks.find(t => t.id === props.id)
  , [state.trademarks, props.id])
  const [name, setName] = useState(trademark.name)
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])

  const handleEdit = async () => {
    try{
      await editTrademark({
        id: trademark.id,
        name
      })
      showMessage(state.labels.editSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  return (
    <Page>
      <Navbar title={state.labels.editTrademark} backLink={state.labels.back} />
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
      {!name || (name === trademark.name) ? '' :
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
export default EditTrademark
