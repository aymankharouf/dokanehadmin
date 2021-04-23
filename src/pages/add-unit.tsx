import { useContext, useState, useEffect } from 'react'
import { StateContext } from '../data/state-provider'
import { f7, Page, Navbar, List, ListInput, Fab, Icon, ListItem } from 'framework7-react'
import labels from '../data/labels'
import { addUnit, showMessage, showError, getMessage } from '../data/actions'
import { unitTypes } from '../data/config'

const AddPackType = () => {
  const { state } = useContext(StateContext)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [factor, setFactor] = useState(0)
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleSubmit = () => {
    try{
      if (state.units.filter(u => u.name === name).length > 0) {
        throw new Error('duplicateName')
      }
      if (state.units.filter(u => u.type === type && u.factor === factor).length > 0) {
        throw new Error('duplicateUnit')
      }
      if (factor < 1) throw new Error('factorError')
      addUnit({
        id: Math.random().toString(),
        name,
        type,
        factor
      })
      showMessage(labels.addSuccess)
      f7.views.current.router.back()
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  return (
    <Page>
      <Navbar title={labels.addUnit} backLink={labels.back} />
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
        <ListItem
          title={labels.type}
          smartSelect
          id="types"
          smartSelectParams={{
            el: "#types", 
            openIn: "popup",
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close,
            renderPage: undefined
          }}
        >
          <select name="type" value={type} onChange={e => setType(e.target.value)}>
            <option value=""></option>
            {unitTypes.map(t => 
              <option key={t.id} value={t.id}>{t.name}</option>
            )}
          </select>
        </ListItem>
        <ListInput 
          name="factor" 
          label={labels.factor} 
          clearButton
          type="number"
          value={factor}
          onChange={e => setFactor(e.target.value)}
          onInputClear={() => setFactor(0)}
        />
      </List>
      {name && type && factor &&
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default AddPackType
