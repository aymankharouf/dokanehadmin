import React, { useState, useContext } from 'react'
import { addTrademark } from '../data/Actions'
import {Page, Navbar, List, ListInput, Button, Block} from 'framework7-react';
import { StoreContext } from '../data/Store';


const AddTrademark = props => {
  const { state, dispatch } = useContext(StoreContext)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const handleSubmit = () => {
    try{
      if (name === '') {
        throw new Error(state.labels.enterName)
      }
      addTrademark({
        name,
      }).then(id => {
        dispatch({type: 'ADD_TRADEMARK', trademark: {id, name}})
        props.f7router.back()
      })
    } catch(err) {
      setError(err.message)
    }
  }
  return (
    <Page>
      <Navbar title='Add New Trademark' backLink='Back' />
      {error ? <Block strong className="error">{error}</Block> : null}
      <List form>
        <ListInput name="name" label="Name" floatingLabel type="text" onChange={(e) => setName(e.target.value)}/>
        <Button fill onClick={() => handleSubmit()}>Submit</Button>
      </List>
    </Page>
  )
}
export default AddTrademark
