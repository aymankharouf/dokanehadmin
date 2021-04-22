import { useState, useContext, useEffect } from 'react'
import { editLocation, showMessage, showError, getMessage } from '../data/actions'
import { f7, Page, Navbar, List, ListInput, Fab, Icon } from 'framework7-react'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'

type Props = {
  id: string
}
const EditLocation = (props: Props) => {
  const { state } = useContext(StateContext)
  const [error, setError] = useState('')
  const [location] = useState(() => state.locations.find(l => l.id === props.id)!)
  const [name, setName] = useState(location?.name)
  const [ordering, setOrdering] = useState(location?.ordering)
  const [hasChanged, setHasChanged] = useState(false)
  useEffect(() => {
    if (name !== location?.name
    || ordering !== location?.ordering) setHasChanged(true)
    else setHasChanged(false)
  }, [location, name, ordering])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleEdit = () => {
    try{
      const newLocation = {
        ...location,
        name,
        ordering
      }
      editLocation(newLocation, state.locations)
      showMessage(labels.editSuccess)
      f7.views.current.router.back()  
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  return (
    <Page>
      <Navbar title={labels.editLocation} backLink={labels.back} />
      <List form inlineLabels>
        <ListInput 
          name="name" 
          label={labels.name}
          value={name}
          clearButton
          autofocus
          type="text" 
          onChange={e => setName(e.target.value)}
          onInputClear={() => setName('')}
        />
        <ListInput 
          name="ordering" 
          label={labels.ordering}
          clearButton
          type="number" 
          value={ordering} 
          onChange={e => setOrdering(e.target.value)}
          onInputClear={() => setOrdering(0)}
        />
      </List>
      {name && ordering && hasChanged &&
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleEdit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default EditLocation
