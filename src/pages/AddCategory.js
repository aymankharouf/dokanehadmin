import React, { useState, useContext } from 'react'
import { addCategory } from '../data/Actions'
import {Page, Navbar, List, ListItem, ListInput, Button, Block} from 'framework7-react';
import { StoreContext } from '../data/Store';


const AddCategory = props => {
  const { state, dispatch } = useContext(StoreContext)
  const section = state.sections.find(rec => rec.id === props.id)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const handleSubmit = () => {
    try{
      if (name === '') {
        throw 'enter category name'
      }
      addCategory({
        sectionId: props.id,
        name
      }).then(id => {
        dispatch({type: 'ADD_CATEGORY', category: {id, name, sectionId: props.id}})
        props.f7router.navigate(`/section/${props.id}`)
      })
    } catch(err) {
      setError(err)
    }
  }
  return (
    <Page>
      <Navbar title={`Add New Category - ${section.name}`} backLink='Back' />
      <List form>
        <ListInput name="name" label="Name" floatingLabel type="text" onChange={(e) => setName(e.target.value)}/>
        <Button fill onClick={() => handleSubmit()}>Submit</Button>
      </List>
      <Block strong className="error">
        <p>{error}</p>
      </Block>
    </Page>
  )
}
export default AddCategory
