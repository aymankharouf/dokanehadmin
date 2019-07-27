import React, { useState, useContext } from 'react'
import { addStore } from '../data/Actions'
import {Page, Navbar, List, ListItem, ListInput, Button, Block} from 'framework7-react';
import { StoreContext } from '../data/Store';


const AddStore = props => {
  const { state } = useContext(StoreContext)
  const [storeType, setStoreType] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const handleSubmit = () => {
    try{
      if (name === '') {
        throw 'enter store name'
      }
      if (storeType === '') {
        throw 'enter store type'
      }
      addStore({
        name,
        storeType,
        lastVisit: null,
        productsCount: 0,
        sales: 0,
      }).then(() => {
        props.f7router.navigate('/stores/')
      })
    } catch(err) {
      setError(err)
    }
  }
  const storeTypesOptionsTags = state.storeTypes.map(storeType => <option key={storeType.id} value={storeType.id}>{storeType.name}</option>)
  return (
    <Page>
      <Navbar title='Add New Store' backLink='Back' />
      <List form>
        <ListItem
          title='Type'
          smartSelect
          smartSelectParams={{openIn: 'popup', closeOnSelect: true, searchbar: true, searchbarPlaceholder: 'Search store type'}}
        >
          <select name='storeType' defaultValue="" onChange={(e) => setStoreType(e.target.value)}>
            <option value="" disabled></option>
            {storeTypesOptionsTags}
          </select>
        </ListItem>
        <ListInput name="name" label="Name" floatingLabel type="text" onChange={(e) => setName(e.target.value)}/>
        <Button fill onClick={() => handleSubmit()}>Submit</Button>
      </List>
      <Block strong className="error">
        <p>{error}</p>
      </Block>
    </Page>
  )
}
export default AddStore
