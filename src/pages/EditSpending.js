import React, { useState, useContext, useMemo, useEffect } from 'react'
import { editSpending, showMessage, showError, getMessage } from '../data/actions'
import { Page, Navbar, List, ListInput, Fab, Icon, Toolbar, ListItem } from 'framework7-react'
import { StoreContext } from '../data/store'
import BottomToolbar from './BottomToolbar'


const EditSpending = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const spending = useMemo(() => state.spendings.find(s => s.id === props.id)
  , [state.spendings, props.id])
  const [type, setType] = useState(spending.type)
  const [spendingAmount, setSpendingAmount] = useState((spending.spendingAmount / 1000).toFixed(3))
  const [spendingAmountErrorMessage, setSpendingAmountErrorMessage] = useState('')
  const initSpendingDate = spending.spendingDate ? [spending.spendingDate.toDate()] : ''
  const [spendingDate, setSpendingDate] = useState(initSpendingDate)
  const [spendingDateErrorMessage, setSpendingDateErrorMessage] = useState('')
  const [description, setDescription] = useState(spending.description)
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

  const handleEdit = async () => {
    try{
      const formatedDate = spendingDate.length > 0 ? new Date(spendingDate) : ''
      await editSpending({
        id: spending.id,
        type,
        spendingAmount: spendingAmount,
        spendingDate: formatedDate,
        description
      })
      showMessage(state.labels.editSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
		}    
  }
  const hasChanged = useMemo(() => {
    if (spendingAmount * 1000 !== spending.spendingAmount) return true
    if (type !== spending.type) return true
    if (description !== spending.description) return true
    if (!spending.spendingDate && spendingDate.length > 0) return true
    if (spending.spendingDate && spendingDate.length === 0) return true
    if ((spending.spendingDate.toDate()).toString() !== (new Date(spendingDate)).toString()) return true
    return false
  }, [spending, spendingAmount, spendingDate, type, description])

  return (
    <Page>
      <Navbar title={state.labels.editSpending} backLink={state.labels.back} />
      <List form>
      <ListInput 
          name="spendingAmount" 
          label={state.labels.spendingAmount}
          value={spendingAmount}
          floatingLabel
          clearButton 
          type="number" 
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
            {state.spendingTypes.map(t => 
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
      {!spendingAmount || !type || !spendingDate || spendingAmountErrorMessage || spendingDateErrorMessage || !hasChanged ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleEdit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>

    </Page>
  )
}
export default EditSpending
