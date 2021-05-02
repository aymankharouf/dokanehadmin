import {useState, useEffect, useContext} from 'react'
import {f7, Page, Navbar, List, ListInput, Fab, Icon} from 'framework7-react'
import labels from '../data/labels'
import {addCategory, showMessage, showError, getMessage} from '../data/actions'
import {StateContext} from '../data/state-provider'

type Props = {
  id: string
}
const AddCategory = (props: Props) => {
  const {state} = useContext(StateContext)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [ordering, setOrdering] = useState(() => {
    const siblings = state.categories.filter(c => c.id === props.id)
    const siblingsOrder = siblings.map(s => s.ordering)
    const maxOrder = Math.max(...siblingsOrder) || 0
    return maxOrder + 1
  })
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleSubmit = () => {
    try{
      addCategory(props.id, name, +ordering)
      showMessage(labels.addSuccess)
      f7.views.current.router.back()
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  
  return (
    <Page>
      <Navbar title={labels.addCategory} backLink={labels.back} />
      <List form inlineLabels>
        <ListInput 
          name="name" 
          label={labels.name}
          clearButton
          autofocus
          type="text"
          value={name}
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
      {name && ordering &&
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default AddCategory
