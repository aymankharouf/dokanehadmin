import React, { useState, useContext, useMemo, useEffect } from 'react'
import { editCategory, showMessage, showError, getMessage } from '../data/actions'
import { Page, Navbar, List, ListInput, Fab, Icon, Toolbar } from 'framework7-react'
import { StoreContext } from '../data/store'
import BottomToolbar from './BottomToolbar'
import labels from '../data/labels'


const EditCategory = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const category = useMemo(() => state.categories.find(c => c.id === props.id)
  , [state.categories, props.id])
  const [name, setName] = useState(category.name)
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])

  const handleEdit = async () => {
    try{
      await editCategory({
        id: category.id,
        name
      })
      showMessage(labels.editSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  
  return (
    <Page>
      <Navbar title={labels.editCategory} backLink={labels.back} />
      <List form>
        <ListInput 
          name="name" 
          label={labels.name}
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
