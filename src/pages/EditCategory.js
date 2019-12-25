import React, { useState, useContext, useMemo, useEffect } from 'react'
import { editCategory, showMessage, showError, getMessage } from '../data/Actions'
import { Page, Navbar, List, ListInput, Fab, Icon, Toolbar } from 'framework7-react';
import { StoreContext } from '../data/Store';
import BottomToolbar from './BottomToolbar';


const EditCategory = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const category = useMemo(() => state.categories.find(c => c.id === props.id)
  , [state.categories, props.id])
  const [name, setName] = useState(category.name)
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
        name
      })
      showMessage(props, state.labels.editSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
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
          onChange={e => setName(e.target.value)}
        />
      </List>
      {!name || name === category.name  ? '' :
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
export default EditCategory
