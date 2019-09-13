import React, { useState, useContext } from 'react'
import { addSection } from '../data/Actions'
import {Page, Navbar, List, ListInput, Button, Block} from 'framework7-react';
import { StoreContext } from '../data/Store';


const AddSection = props => {
  const { state, dispatch } = useContext(StoreContext)
  const [name, setName] = useState('')
  const [percent, setPercent] = useState('')
  const [error, setError] = useState('')
  const handleSubmit = () => {
    try{
      if (name === '') {
        throw new Error(state.labels.enterName)
      }
      if (percent === '') {
        throw new Error(state.labels.enterPercent)
      }
      addSection({
        name,
        percent
      }).then(() => {
        props.f7router.back()
      })
    } catch(err) {
      setError(err.message)
    }
  }
  return (
    <Page>
      <Navbar title='Add New Section' backLink='Back' />
      {error ? <Block strong className="error">{error}</Block> : null}
      <List form>
        <ListInput name="name" label="Name" floatingLabel type="text" onChange={(e) => setName(e.target.value)}/>
        <ListInput name="percent" label="Percent" floatingLabel type="number" onChange={(e) => setPercent(e.target.value)}/>
        <Button fill onClick={() => handleSubmit()}>Submit</Button>
      </List>
    </Page>
  )
}
export default AddSection
