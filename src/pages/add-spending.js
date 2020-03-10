import React, { useState, useEffect } from 'react'
import { Page, Navbar, List, ListItem, ListInput, Fab, Icon } from 'framework7-react'
import labels from '../data/labels'
import { spendingTypes } from '../data/config'
import { addSpending, showMessage, showError, getMessage } from '../data/actions'

const AddSpending = props => {
  const [error, setError] = useState('')
  const [type, setType] = useState('')
  const [spendingAmount, setSpendingAmount] = useState('')
  const [spendingAmountErrorMessage, setSpendingAmountErrorMessage] = useState('')
  const [spendingDate, setSpendingDate] = useState([new Date()])
  const [spendingDateErrorMessage, setSpendingDateErrorMessage] = useState('')
  const [description, setDescription] = useState('')
  useEffect(() => {
    const validateAmount = value => {
      if (value > 0){
        setSpendingAmountErrorMessage('')
      } else {
        setSpendingAmountErrorMessage(labels.invalidValue)
      }
    }
    if (spendingAmount) validateAmount(spendingAmount)
    else setSpendingAmountErrorMessage('')
  }, [spendingAmount])

  useEffect(() => {
    const validateDate = value => {
      if (new Date(value) > new Date()){
        setSpendingDateErrorMessage(labels.invalidSpendingDate)
      } else {
        setSpendingDateErrorMessage('')
      }
    }
    if (spendingDate.length > 0) validateDate(spendingDate)
    else setSpendingDateErrorMessage('')
  }, [spendingDate])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleSubmit = () => {
    try{
      const formatedDate = spendingDate.length > 0 ? new Date(spendingDate) : ''
      addSpending({
        type,
        spendingAmount: spendingAmount * 1000,
        spendingDate: formatedDate,
        description,
        time: new Date()
      })
      showMessage(labels.addSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  return (
    <Page>
      <Navbar title={labels.newSpending} backLink={labels.back} />
      <List form inlineLabels>
        <ListInput 
          name="spendingAmount" 
          label={labels.spendingAmount}
          value={spendingAmount}
          clearButton 
          type="number" 
          errorMessage={spendingAmountErrorMessage}
          errorMessageForce
          onChange={e => setSpendingAmount(e.target.value)}
          onInputClear={() => setSpendingAmount('')}
        />
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
            {spendingTypes.map(t => 
              <option key={t.id} value={t.id}>{t.name}</option>
            )}
          </select>
        </ListItem>
        <ListInput 
          name="description" 
          label={labels.description}
          value={description}
          clearButton 
          type="text" 
          onChange={e => setDescription(e.target.value)}
          onInputClear={() => setDescription('')}
        />
        <ListInput
          name="spendingDate"
          label={labels.spendingDate}
          type="datepicker"
          value={spendingDate} 
          clearButton
          errorMessage={spendingDateErrorMessage}
          errorMessageForce
          onCalendarChange={value => setSpendingDate(value)}
          onInputClear={() => setSpendingDate([])}
        />

      </List>
      {!spendingAmount || !type || !spendingDate || spendingAmountErrorMessage || spendingDateErrorMessage ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default AddSpending
