import React, { useState, useEffect } from 'react'
import { addCategory, showMessage, showError, getMessage } from '../data/actions'
import { f7, Page, Navbar, List, ListInput, Fab, Icon } from 'framework7-react'
import labels from '../data/labels'


const AddCategory = props => {
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [name, setName] = useState('')
  const [ordering, setOrdering] = useState('')
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  useEffect(() => {
    if (inprocess) {
      f7.dialog.preloader(labels.inprocess)
    } else {
      f7.dialog.close()
    }
  }, [inprocess])

  const handleSubmit = async () => {
    try{
      setInprocess(true)
      await addCategory(props.id, name, Number(ordering))
      setInprocess(false)
      showMessage(labels.addSuccess)
      props.f7router.back()
    } catch(err) {
      setInprocess(false)
			setError(getMessage(props, err))
		}
  }
  
  return (
    <Page>
      <Navbar title={labels.addCategory} backLink={labels.back} />
      <List form>
        <ListInput 
          name="name" 
          label={labels.name}
          floatingLabel 
          clearButton
          type="text" 
          onChange={e => setName(e.target.value)}
          onInputClear={() => setName('')}
        />
        <ListInput 
          name="ordering" 
          label={labels.ordering}
          floatingLabel 
          clearButton
          type="number" 
          onChange={e => setOrdering(e.target.value)}
          onInputClear={() => setOrdering('')}
        />
      </List>
      {!name || !ordering ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default AddCategory
