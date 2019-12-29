import React, { useState, useContext, useEffect, useMemo } from 'react'
import { addSpending, showMessage, showError, getMessage } from '../data/actions'
import { Page, Navbar, List, ListItem, ListInput, Fab, Icon } from 'framework7-react'
import { StoreContext } from '../data/store'
import labels from '../data/labels'


const AddSpending = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [type, setType] = useState('')
  const [spendingAmount, setSpendingAmount] = useState('')
  const [spendingAmountErrorMessage, setSpendingAmountErrorMessage] = useState('')
  const [spendingDate, setSpendingDate] = useState([new Date()])
  const [spendingDateErrorMessage, setSpendingDateErrorMessage] = useState('')
  const [description, setDescription] = useState('')
  const spendingTypes = useMemo(() => [...state.spendingTypes].sort((t1, t2) => t1.name > t2.name ? 1 : -1)
  , [state.spendingTypes])

  useEffect(() => {
    const validateAmount = value => {
      if (value > 0){
        setSpendingAmountErrorMessage('')
      } else {
        setSpendingAmountErrorMessage(state.labels.invalidValue)
      }
    }
    if (spendingAmount) validateAmount(spendingAmount)
    else setSpendingAmountErrorMessage('')
  }, [spendingAmount, state.labels])

  useEffect(() => {
    const validateDate = value => {
      if (new Date(value) > new Date()){
        setSpendingDateErrorMessage(state.labels.invalidSpendingDate)
      } else {
        setSpendingDateErrorMessage('')
      }
    }
    if (spendingDate.length > 0) validateDate(spendingDate)
    else setSpendingDateErrorMessage('')
  }, [spendingDate, state.labels])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])

  const handleSubmit = async () => {
    try{
      const formatedDate = spendingDate.length > 0 ? new Date(spendingDate) : ''
      await addSpending({
        type,
        spendingAmount: spendingAmount * 1000,
        spendingDate: formatedDate,
        description
      })
      showMessage(state.labels.addSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  return (
    <Page>
      <Navbar title={state.labels.newSpending} backLink={state.labels.back} />
      <List form>
        <ListInput 
          name="spendingAmount" 
          label={state.labels.spendingAmount}
          value={spendingAmount}
          floatingLabel
          clearButton 
          type="number" 
          errorMessage={spendingAmountErrorMessage}
          errorMessageForce
          onChange={e => setSpendingAmount(e.target.value)}
          onInputClear={() => setSpendingAmount('')}
        />
        <ListItem
          title={state.labels.type}
          smartSelect
          smartSelectParams={{
            openIn: "popup", 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: state.labels.search,
            popupCloseLinkText: state.labels.close
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
          label={state.labels.description}
          value={description}
          floatingLabel
          clearButton 
          type="text" 
          onChange={e => setDescription(e.target.value)}
          onInputClear={() => setDescription('')}
        />
        <ListInput
          name="spendingDate"
          label={state.labels.spendingDate}
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
