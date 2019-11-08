import React, { useState, useContext, useEffect, useMemo } from 'react'
import { addCost, showMessage } from '../data/Actions'
import {Page, Navbar, List, ListItem, ListInput, Block, Fab, Icon} from 'framework7-react';
import { StoreContext } from '../data/Store';


const AddCost = props => {
  const { state } = useContext(StoreContext)
  const [type, setType] = useState('')
  const [value, setValue] = useState('')
  const [valueErrorMessage, setValueErrorMessage] = useState('')
  const [costDate, setCostDate] = useState('')
  const [costDateErrorMessage, setCostDateErrorMessage] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    const validateValue = v => {
      if (v > 0){
        setValueErrorMessage('')
      } else {
        setValueErrorMessage(state.labels.invalidCostValue)
      }
    }
    if (value) validateValue(value)
    else setValueErrorMessage('')
  }, [value])

  useEffect(() => {
    const validateDate = value => {
      if (new Date(value) > new Date()){
        setCostDateErrorMessage(state.labels.invalidCostDate)
      } else {
        setCostDateErrorMessage('')
      }
    }
    if (costDate.length > 0) validateDate(costDate)
    else setCostDateErrorMessage('')
  }, [costDate])

  const handleSubmit = () => {
    const date = costDate.length > 0 ? new Date(costDate) : ''
    addCost({
      type,
      value,
      costDate: date,
      description
    }).then(() => {
      showMessage(props, 'success', state.labels.addSuccess)
      props.f7router.back()
    })
  }
  const costTypesTags = useMemo(() => state.costTypes.map(rec => 
    <option key={rec.id} value={rec.id}>{rec.name}</option>
  ), [state.costTypes])
  return (
    <Page>
      <Navbar title={state.labels.newCost} backLink={state.labels.back} />
      <List form>
        <ListInput 
          name="value" 
          label={state.labels.value}
          value={value}
          floatingLabel
          clearButton 
          type="number" 
          onChange={e => setValue(e.target.value)}
          onInputClear={() => setValue('')}
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
            {costTypesTags}
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
          name="costDate"
          label={state.labels.costDate}
          type="datepicker"
          value={costDate} 
          clearButton
          errorMessage={costDateErrorMessage}
          errorMessageForce
          onCalendarChange={(value) => setCostDate(value)}
          onInputClear={() => setCostDate([])}
        />

      </List>
      {!value || !type || !costDate || valueErrorMessage || costDateErrorMessage ? ''
      : <Fab position="left-top" slot="fixed" color="green" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default AddCost
