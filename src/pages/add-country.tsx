import { useContext, useState, useEffect } from 'react'
import { StateContext } from '../data/state-provider'
import { f7, Page, Navbar, List, ListInput, Fab, Icon } from 'framework7-react'
import labels from '../data/labels'
import { addCountry, showMessage, showError, getMessage } from '../data/actions'


const AddCountry = () => {
  const { state } = useContext(StateContext)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleSubmit = () => {
    try{
      if (state.countries.filter(c => c.name === name).length > 0) {
        throw new Error('duplicateName')
      }
      addCountry({
        id: Math.random().toString(),
        name
      })
      showMessage(labels.addSuccess)
      f7.views.current.router.back()
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  return (
    <Page>
      <Navbar title={labels.addCountry} backLink={labels.back} />
      <List form inlineLabels>
        <ListInput 
          autofocus
          name="name" 
          label={labels.name} 
          clearButton
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onInputClear={() => setName('')}
        />
      </List>
      {name &&
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default AddCountry
