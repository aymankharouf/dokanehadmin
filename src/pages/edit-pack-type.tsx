import { useState, useContext, useEffect } from 'react'
import { f7, Page, Navbar, List, ListInput, Fab, Icon, FabButton, FabButtons, FabBackdrop } from 'framework7-react'
import { StateContext } from '../data/state-provider'
import { editPackType, showMessage, showError, getMessage, deleteCountry } from '../data/actions'
import labels from '../data/labels'

interface Props {
  id: string
}
const EditPackType = (props: Props) => {
  const { state } = useContext(StateContext)
  const [error, setError] = useState('')
  const [packType] = useState(() => state.packTypes.find(c => c.id === props.id)!)
  const [name, setName] = useState(packType?.name)
  const [hasChanged, setHasChanged] = useState(false)
  useEffect(() => {
    if (name !== packType?.name) setHasChanged(true)
    else setHasChanged(false)
  }, [packType, name])

  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleEdit = () => {
    try{
      const newPackType = {
        ...packType,
        name,
      }
      editPackType(newPackType, state.packTypes)
      showMessage(labels.editSuccess)
      f7.views.current.router.back()
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  const handleDelete = () => {
    f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, () => {
      try{
        const infictedPacks = state.packs.filter(p => p.packTypeId === props.id)
        if (infictedPacks.length > 0) throw new Error('infictedPacksFound') 
        deleteCountry(props.id, state.countries)
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
          type="text" 
          onChange={e => setName(e.target.value)}
          onInputClear={() => setName('')}
        />
      </List>
      <FabBackdrop slot="fixed" />
      <Fab position="left-top" slot="fixed" color="orange" className="top-fab">
        <Icon material="keyboard_arrow_down"></Icon>
        <Icon material="close"></Icon>
        <FabButtons position="bottom">
          {name && hasChanged &&
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
export default EditPackType
