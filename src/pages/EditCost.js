import React, { useState, useContext, useMemo, useEffect } from 'react'
import { editCost, showMessage } from '../data/Actions'
import {Page, Navbar, List, ListInput, Fab, Icon, Toolbar, ListItem, Toggle} from 'framework7-react';
import { StoreContext } from '../data/Store';
import BottomToolbar from './BottomToolbar';


const EditCost = props => {
  const { state } = useContext(StoreContext)
  const cost = useMemo(() => state.costs.find(rec => rec.id === props.id), [state.costs])
  const [type, setType] = useState(cost.type)
  const [value, setValue] = useState(cost.value)
  const [valueErrorMessage, setValueErrorMessage] = useState('')
  const [costDate, setCostDate] = useState(cost.costDate)
  const [costDateErrorMessage, setCostDateErrorMessage] = useState('')
  const [description, setDescription] = useState(cost.description)
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

  const handleEdit = () => {
    const date = costDate.length > 0 ? new Date(costDate) : ''
    editCost({
      id: cost.id,
      type,
      value,
      costDate: date,
      description
    }).then(() => {
      showMessage(props, 'success', state.labels.editSuccess)
      props.f7router.back()
    })
  }
  const costTypesTags = useMemo(() => state.costTypes.map(rec => 
    <option key={rec.id} value={rec.id}>{rec.name}</option>
  ), [state.costTypes])
  return (
    <Page>
      <Navbar title={state.labels.editCost} backLink={state.labels.back} />
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
            <option value="" disabled></option>
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
      {!value || !type || !costDate || valueErrorMessage || costDateErrorMessage || (value === cost.value && type === cost.type && costDate === cost.costDate && description === cost.description)
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
export default EditCost
