import { useContext, useState, useEffect } from 'react'
import { StoreContext } from '../data/store'
import { f7, Page, Navbar, List, ListInput, Fab, Icon } from 'framework7-react'
import Footer from './footer'
import labels from '../data/labels'
import { addCountry, showMessage, showError, getMessage } from '../data/actions'


const AddCountry = () => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [ename, setEname] = useState('')
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
        name,
        ename
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
          name="name" 
          label={labels.name} 
          clearButton
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onInputClear={() => setName('')}
        />
        <ListInput 
          name="ename" 
          label={labels.ename} 
          clearButton
          type="text"
          value={ename}
          onChange={e => setEname(e.target.value)}
          onInputClear={() => setEname('')}
        />
      </List>
      {!name ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
      <Footer/>
    </Page>
  )
}
export default AddCountry
