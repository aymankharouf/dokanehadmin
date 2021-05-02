import {useState, useContext, useEffect} from 'react'
import {f7, Page, Navbar, List, ListInput, Fab, Icon, FabButton, FabButtons, FabBackdrop, ListItem} from 'framework7-react'
import {StateContext} from '../data/state-provider'
import {editUnit, showMessage, showError, getMessage, deleteUnit} from '../data/actions'
import labels from '../data/labels'
import {unitTypes} from '../data/config'

type Props = {
  id: string
}
const EditUnit = (props: Props) => {
  const {state} = useContext(StateContext)
  const [error, setError] = useState('')
  const [unit] = useState(() => state.units.find(u => u.id === props.id)!)
  const [name, setName] = useState(unit.name)
  const [type, setType] = useState('')
  const [factor, setFactor] = useState(0)
  const [hasChanged, setHasChanged] = useState(false)
  useEffect(() => {
    if (name !== unit.name || type !== unit.type || factor !== unit.factor) setHasChanged(true)
    else setHasChanged(false)
  }, [unit, name, type, factor])

  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleEdit = () => {
    try{
      const newUnit = {
        ...unit,
        name,
        type,
        factor
      }
      editUnit(newUnit, state.units)
      showMessage(labels.editSuccess)
      f7.views.current.router.back()
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  const handleDelete = () => {
    f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, () => {
      try{
        const infictedPacks = state.packs.filter(p => p.unitId === props.id)
        if (infictedPacks.length > 0) throw new Error('infictedPacksFound') 
        deleteUnit(props.id, state.units)
        showMessage(labels.deleteSuccess)
        f7.views.current.router.back()
      } catch(err) {
        setError(getMessage(f7.views.current.router.currentRoute.path, err))
      }
    })
  }
  return (
    <Page>
      <Navbar title={labels.editPackType} backLink={labels.back} />
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
        <ListItem 
          title={labels.type}
          smartSelect
          // @ts-ignore
          smartSelectParams={{
            // el: "#types", 
            openIn: "sheet",
            closeOnSelect: true, 
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
      <FabBackdrop slot="fixed" />
      <Fab position="left-top" slot="fixed" color="orange" className="top-fab">
        <Icon material="keyboard_arrow_down"></Icon>
        <Icon material="close"></Icon>
        <FabButtons position="bottom">
          {name && factor && type && hasChanged &&
            <FabButton color="green" onClick={() => handleEdit()}>
              <Icon material="done"></Icon>
            </FabButton>
          }
          <FabButton color="red" onClick={() => handleDelete()}>
            <Icon material="delete"></Icon>
          </FabButton>
        </FabButtons>
      </Fab>
    </Page>
  )
}
export default EditUnit
