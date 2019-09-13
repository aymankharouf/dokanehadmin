import React, { useState, useContext, useEffect } from 'react'
import { addStore } from '../data/Actions'
import {Page, Navbar, List, ListItem, ListInput, Block, Fab, Icon} from 'framework7-react';
import { StoreContext } from '../data/Store';


const AddStore = props => {
  const { state, dispatch } = useContext(StoreContext)
  const [type, setType] = useState('')
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const patterns = {
      mobile: /^07[7-9][0-9]{7}$/
    }
    const validateMobile = (value) => {
      if (patterns.mobile.test(value)){
        setError('')
      } else {
        setError(state.labels.invalidMobile)
      }
    }
    if (mobile !== '') validateMobile(mobile)
  }, [mobile])

  const handleSubmit = () => {
    try{
      if (name === '') {
        throw new Error(state.labels.enterName)
      }
      if (type === '') {
        throw new Error(state.labels.enterCategory)
      }
      addStore({
        name,
        type,
        mobile,
        address
      }).then(() => {
        props.f7router.back()
      })
    } catch(err) {
      setError(err.message)
    }
  }
  const storeTypesOptionsTags = state.storeTypes.map(storeType => <option key={storeType.id} value={storeType.id}>{storeType.name}</option>)
  return (
    <Page>
      <Navbar title={state.labels.newStore} backLink='Back' />
      {error ? <Block strong className="error">{error}</Block> : null}
      <List form>
        <ListInput 
          name="name" 
          label={state.labels.name}
          value={name}
          floatingLabel
          clearButton 
          type="text" 
          onChange={(e) => setName(e.target.value)}
          onInputClear={() => setName('')}
        />
        <ListInput
          label={state.labels.mobile}
          type="number"
          name="mobile"
          clearButton
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          onInputClear={() => setMobile('')}
        />
        <ListInput 
          name="address" 
          label={state.labels.address}
          value={address}
          floatingLabel
          clearButton 
          type="textarea" 
          onChange={(e) => setAddress(e.target.value)}
          onInputClear={() => setAddress('')}
        />
        <ListItem
          title={state.labels.type}
          smartSelect
          smartSelectParams={{openIn: 'popup', closeOnSelect: true, searchbar: true, searchbarPlaceholder: 'Search store type'}}
        >
          <select name='type' defaultValue="" onChange={(e) => setType(e.target.value)}>
            <option value="" disabled></option>
            {storeTypesOptionsTags}
          </select>
        </ListItem>
      </List>
      <Fab position="center-bottom" slot="fixed" text={state.labels.submit} color="green" onClick={() => handleSubmit()}>
        <Icon ios="f7:check" aurora="f7:check" md="material:done"></Icon>
      </Fab>
    </Page>
  )
}
export default AddStore
