import React, { useState, useContext } from 'react'
import { addSection } from '../data/Actions'
import {Page, Navbar, List, ListInput, Button, Block} from 'framework7-react';
import { StoreContext } from '../data/Store';


const AddSection = props => {
  const { dispatch } = useContext(StoreContext)
  const [name, setName] = useState('')
  const [percent, setPercent] = useState('')
  const [error, setError] = useState('')
  const handleSubmit = () => {
    try{
      if (name === '') {
        throw 'enter section name'
      }
      if (percent === '') {
        throw 'enter section percent'
      }
      addSection({
        name,
        percent
      }).then(id => {
        dispatch({type: 'ADD_SECTION', section: {id, name, percent}})
        props.f7router.back()
      })
    } catch(err) {
      setError(err)
    }
  }
  return (
    <Page>
      <Navbar title='Add New Section' backLink='Back' />
      <List form>
        <ListInput name="name" label="Name" floatingLabel type="text" onChange={(e) => setName(e.target.value)}/>
        <ListInput name="percent" label="Percent" floatingLabel type="number" onChange={(e) => setPercent(e.target.value)}/>
        <Button fill onClick={() => handleSubmit()}>Submit</Button>
      </List>
      <Block strong className="error">
        <p>{error}</p>
      </Block>
    </Page>
  )
}
export default AddSection
