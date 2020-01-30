import React, { useState, useContext, useEffect } from 'react'
import { editSpending, showMessage, showError, getMessage } from '../data/actions'
import { f7, Page, Navbar, List, ListInput, Fab, Icon, Toolbar, ListItem } from 'framework7-react'
import { StoreContext } from '../data/store'
import BottomToolbar from './bottom-toolbar'
import labels from '../data/labels'
import { spendingTypes } from '../data/config'

const EditSpending = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [spending] = useState(() => state.spendings.find(s => s.id === props.id))
  const [type, setType] = useState('')
  const [spendingAmount, setSpendingAmount] = useState('')
  const [spendingAmountErrorMessage, setSpendingAmountErrorMessage] = useState('')
  const [spendingDate, setSpendingDate] = useState('')
  const [spendingDateErrorMessage, setSpendingDateErrorMessage] = useState('')
  const [description, setDescription] = useState('')
  const [hasChanged, setHasChanged] = useState(false)
  useEffect(() => {
    setType(spending.type)
    setSpendingAmount((spending.spendingAmount / 1000).toFixed(3))
    setSpendingDate(() => spending.spendingDate ? [spending.spendingDate.toDate()] : '')
    setDescription(spending.description)
  }, [spending])
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
  useEffect(() => {
    if (inprocess) {
      f7.dialog.preloader(labels.inprocess)
    } else {
      f7.dialog.close()
    }
  }, [inprocess])

  const handleEdit = async () => {
    try{
      const formatedDate = spendingDate.length > 0 ? new Date(spendingDate) : ''
      setInprocess(true)
      await editSpending({
        id: spending.id,
        type,
        spendingAmount: spendingAmount,
        spendingDate: formatedDate,
        description
      })
      setInprocess(false)
      showMessage(labels.editSuccess)
      props.f7router.back()
    } catch(err) {
      setInprocess(false)
			setError(getMessage(props, err))
		}    
  }
  useEffect(() => {
    if (spendingAmount * 1000 !== spending.spendingAmount
    || type !== spending.type
    || description !== spending.description
    || (!spending.spendingDate && spendingDate.length > 0)
    || (spending.spendingDate && spendingDate.length === 0)
    || (spending.spendingDate.toDate()).toString() !== (new Date(spendingDate)).toString()) setHasChanged(true)
    else setHasChanged(false)
  }, [spending, spendingAmount, spendingDate, type, description])

  return (
    <Page>
      <Navbar title={labels.editSpending} backLink={labels.back} />
      <List form>
      <ListInput 
          name="spendingAmount" 
          label={labels.spendingAmount}
          value={spendingAmount}
          floatingLabel
          clearButton 
          type="number" 
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
          <select name="type" defaultValue={type} onChange={e => setType(e.target.value)}>
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
          floatingLabel
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
