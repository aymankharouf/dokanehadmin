import { useState, useContext, useEffect } from 'react'
import { f7, Page, Navbar, List, ListInput, Fab, Icon, FabButton, FabButtons, FabBackdrop } from 'framework7-react'
import { StateContext } from '../data/state-provider'
import { editTrademark, showMessage, showError, getMessage, deleteTrademark } from '../data/actions'
import labels from '../data/labels'

type Props = {
  id: string
}
const EditCountry = (props: Props) => {
  const { state } = useContext(StateContext)
  const [error, setError] = useState('')
  const [trademark] = useState(() => state.trademarks.find(t => t.id === props.id)!)
  const [name, setName] = useState(trademark?.name)
  const [hasChanged, setHasChanged] = useState(false)
  useEffect(() => {
    if (name !== trademark?.name) setHasChanged(true)
    else setHasChanged(false)
  }, [trademark, name])

  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleEdit = () => {
    try{
      const newTrademark = {
        ...trademark,
        name
      }
      editTrademark(newTrademark, state.trademarks)
      showMessage(labels.editSuccess)
      f7.views.current.router.back()
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  const handleDelete = () => {
    f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, () => {
      try{
        const trademarkProducts = state.products.filter(p => p.trademarkId === props.id)
        if (trademarkProducts.length > 0) throw new Error('trademarkProductsFound') 
        deleteTrademark(props.id, state.trademarks)
        showMessage(labels.deleteSuccess)
        f7.views.current.router.back()
      } catch(err) {
        setError(getMessage(f7.views.current.router.currentRoute.path, err))
      }
    })
  }
  return (
    <Page>
      <Navbar title={labels.editTrademark} backLink={labels.back} />
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
          {!name || !hasChanged ? '' :
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
export default EditCountry
