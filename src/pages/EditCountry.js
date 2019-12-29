import React, { useState, useContext, useMemo, useEffect } from 'react'
import { editCountry, showMessage, showError, getMessage } from '../data/actions'
import { Page, Navbar, List, ListInput, Fab, Icon, Toolbar } from 'framework7-react'
import { StoreContext } from '../data/store'
import BottomToolbar from './BottomToolbar'


const EditCountry = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const country = useMemo(() => state.countries.find(c => c.id === props.id)
  , [state.countries, props.id])
  const [name, setName] = useState(country.name)
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])

  const handleEdit = async () => {
    try{
      await editCountry({
        id: country.id,
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
      <Navbar title={state.labels.editCountry} backLink={state.labels.back} />
      <List form>
        <ListInput 
          name="name" 
          label={state.labels.name}
          value={name}
          floatingLabel 
          clearButton
          type="text" 
          onChange={e => setName(e.target.value)}
          onInputClear={() => setName('')}
        />
      </List>
      {!name || (name === country.name) ? '' :
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
export default EditCountry
