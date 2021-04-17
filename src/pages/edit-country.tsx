import { useState, useContext, useEffect } from 'react'
import { f7, Page, Navbar, List, ListInput, Fab, Icon, FabButton, FabButtons, FabBackdrop, Toolbar } from 'framework7-react'
import { StoreContext } from '../data/store'
import { editCountry, showMessage, showError, getMessage, deleteCountry } from '../data/actions'
import Footer from './footer'
import labels from '../data/labels'

interface Props {
  id: string
}
const EditCountry = (props: Props) => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [country] = useState(() => state.countries.find(c => c.id === props.id))
  const [name, setName] = useState(country?.name)
  const [hasChanged, setHasChanged] = useState(false)
  useEffect(() => {
    if (name !== country?.name) setHasChanged(true)
    else setHasChanged(false)
  }, [country, name])

  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleEdit = () => {
    try{
      const newCountry = {
        ...country,
        name,
      }
      editCountry(newCountry, state.countries)
      showMessage(labels.editSuccess)
      f7.views.current.router.back()
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  const handleDelete = () => {
    f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, () => {
      try{
        const countryProducts = state.products.filter((p: any) => p.countryId === props.id)
        if (countryProducts.length > 0) throw new Error('countryProductsFound') 
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
      <Navbar title={labels.editCountry} backLink={labels.back} />
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
      <Toolbar bottom>
        <Footer/>
      </Toolbar>
    </Page>
  )
}
export default EditCountry
