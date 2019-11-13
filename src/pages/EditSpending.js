import React, { useState, useContext, useMemo, useEffect } from 'react'
import { editSpending, showMessage } from '../data/Actions'
import {Page, Navbar, List, ListInput, Fab, Icon, Toolbar, ListItem, Toggle} from 'framework7-react';
import { StoreContext } from '../data/Store';
import BottomToolbar from './BottomToolbar';


const EditSpending = props => {
  const { state } = useContext(StoreContext)
  const spending = useMemo(() => state.spendings.find(rec => rec.id === props.id), [state.spendings])
  const [type, setType] = useState(spending.type)
  const [spendingAmount, setSpendingAmount] = useState(spending.spendingAmount)
  const [spendingAmountErrorMessage, setSpendingAmountErrorMessage] = useState('')
  const [spendingDate, setSpendingDate] = useState(spending.spendingDate)
  const [spendingDateErrorMessage, setSpendingDateErrorMessage] = useState('')
  const [description, setDescription] = useState(spending.description)
  useEffect(() => {
    const validateAmount = value => {
      if (value > 0){
        setSpendingAmountErrorMessage('')
      } else {
        setSpendingAmountErrorMessage(state.labels.invalidSpendingAmount)
      }
    }
    if (spendingAmount) validateAmount(spendingAmount)
    else setSpendingAmountErrorMessage('')
  }, [spendingAmount])

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
  }, [spendingDate])

  const handleEdit = () => {
    const formatedDate = spendingDate.length > 0 ? new Date(spendingDate) : ''
    editSpending({
      id: spending.id,
      type,
      spendingAmount,
      spendingDate: formatedDate,
      description
    }).then(() => {
      showMessage(props, 'success', state.labels.editSuccess)
      props.f7router.back()
    })
  }
  const spendingTypesTags = useMemo(() => state.spendingTypes.map(rec => 
    <option key={rec.id} value={rec.id}>{rec.name}</option>
  ), [state.spendingTypes])
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
            openIn: 'popup', 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: state.labels.search,
            popupCloseLinkText: state.labels.close
          }}
        >
          <select name='type' defaultValue="" onChange={e => setType(e.target.value)}>
            <option value=""></option>
            {spendingTypesTags}
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
      {!spendingAmount || !type || !spendingDate || spendingAmountErrorMessage || spendingDateErrorMessage || (spendingAmount === spending.spendingAmount && type === spending.type && spendingDate === spending.spendingDate && description === spending.description)
      ? ''
      : <Fab position="left-top" slot="fixed" color="green" onClick={() => handleEdit()}>
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
