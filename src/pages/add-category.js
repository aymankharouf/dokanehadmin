import React, { useContext, useState, useEffect } from 'react'
import { StoreContext } from '../data/store'
import { Page, Navbar, List, ListInput, Fab, Icon } from 'framework7-react'
import labels from '../data/labels'
import { addCategory, showMessage, showError, getMessage } from '../data/actions'


const AddCategory = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [mainCategory] = useState(() => state.categories.find(c => c.id === props.id))
  const [name, setName] = useState('')
  const [minProfit, setMinProfit] = useState((mainCategory?.minProfit * 100) || '')
  const [maxProfit, setMaxProfit] = useState((mainCategory?.maxProfit * 100) || '')
  const [ordering, setOrdering] = useState('')
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleSubmit = () => {
    try{
      if (Number(minProfit) > Number(maxProfit)) {
        throw new Error('invalidValue')
      }
      addCategory(props.id, name, minProfit / 100, maxProfit / 100, Number(ordering))
      showMessage(labels.addSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
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
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onInputClear={() => setName('')}
        />
        <ListInput 
          name="minProfit" 
          label={labels.minProfit}
          clearButton
          type="number" 
          value={minProfit}
          onChange={e => setMinProfit(e.target.value)}
          onInputClear={() => props.id === '0' ? setMinProfit('') : ''}
          readonly={props.id !== '0'}
        />
        <ListInput 
          name="maxProfit" 
          label={labels.maxProfit}
          clearButton
          type="number" 
          value={maxProfit}
          onChange={e => setMaxProfit(e.target.value)}
          onInputClear={() => props.id === '0' ? setMaxProfit('') : ''}
          readonly={props.id !== '0'}
        />
        <ListInput 
          name="ordering" 
          label={labels.ordering}
          clearButton
          type="number" 
          value={ordering}
          onChange={e => setOrdering(e.target.value)}
          onInputClear={() => setOrdering('')}
        />
      </List>
      {!name || !ordering || !minProfit || !maxProfit ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default AddCategory
