import React, { useState, useContext, useEffect } from 'react'
import { Page, Navbar, List, ListInput, Fab, Icon } from 'framework7-react'
import { StoreContext } from '../data/store'
import { addStorePayment, showMessage, showError, getMessage } from '../data/actions'
import labels from '../data/labels'
import { paymentTypes } from '../data/config'

const AddStorePayment = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [store] = useState(() => state.stores.find(s => s.id === props.id))
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('')
  const [description, setDescription] = useState('')
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleSubmit = () => {
    try{
      if (Number(amount) <= 0) {
        throw new Error('invalidValue')
      }
      const payment = {
        type,
        description,
        amount: amount * 1000,
        time: new Date()
      }
      addStorePayment(store.id, payment)
      showMessage(labels.addSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  return (
    <Page>
      <Navbar title={`${labels.addPayment} ${store.name}`} backLink={labels.back} />
      <List form inlineLabels>
      <ListItem
          title={labels.type}
          smartSelect
          smartSelectParams={{
            openIn: "popup", 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close
          }}
        >
          <select name="type" value={type} onChange={e => setType(e.target.value)}>
            <option value=""></option>
            {paymentTypes.map(t => 
              t.id === '1' ? '' : <option key={t.id} value={t.id}>{t.name}</option>
            )}
          </select>
        </ListItem>
        <ListInput 
          name="amount" 
          label={labels.amount}
          clearButton 
          type="number" 
          value={amount} 
          onChange={e => setAmount(e.target.value)}
          onInputClear={() => setAmount('')}
        />
        <ListInput 
          name="description" 
          label={labels.description}
          clearButton 
          type="text" 
          value={description} 
          onChange={e => setDescription(e.target.value)}
          onInputClear={() => setDescription('')}
        />
      </List>
      {!amount || !type ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default AddStorePayment
