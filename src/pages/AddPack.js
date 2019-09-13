import React, { useState, useContext, useEffect } from 'react'
import { addPack } from '../data/Actions'
import {Page, Navbar, List, ListItem, ListInput, Block, Fab, Icon, Toggle, BlockTitle, Link, Button, Row, Col} from 'framework7-react';
import { StoreContext } from '../data/Store';


const AddPack = props => {
  const { state, dispatch } = useContext(StoreContext)
  const product = state.products.find(rec => rec.id === props.id)
  const [name, setName] = useState('')
  const [isOffer, setIsOffer] = useState(false)
  const [error, setError] = useState('')
  let i = 0
  const handleSubmit = () => {
    try{
      if (name === '') {
        throw new Error(state.labels.enterName)
      }
      addPack(
        product,
        name,
        isOffer,
        state.packComponents
        ).then(() => {
          dispatch({type: 'CLEAR_PACK_COMPONENTS'})
          props.f7router.back()
      })
    } catch (err) {
      setError(err.message)
    }
  }
  useEffect(() => {
    dispatch({type: 'CLEAR_PACK_COMPONENTS'})
  }, [])
  const componentTags = state.packComponents ? state.packComponents.map(component => {
    return(
      <ListItem
        link='#'
        title={state.products.find(rec => rec.id === component.productId).name}
        after={component.quantity}
        footer={state.packs.find(rec => rec.id === component.packId).name}
        key={i++}
        onClick={() => dispatch({type: 'DELETE_COMPONENT', component})}
      />
    )
  }) : ''
  return (
    <Page>
      <Navbar title={`${state.labels.addPack} - ${product.name}`} backLink="Back" />
      {error ? <Block strong className="error">{error}</Block> : null}
      <List form>
        <ListInput 
          name="name" 
          label={state.labels.name}
          floatingLabel 
          clearButton
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          onInputClear={() => setName('')}
        />
        <ListItem>
          <span>{state.labels.isOffer}</span>
          <Toggle name="isOffer" color="green" checked={isOffer} onToggleChange={() => setIsOffer(!isOffer)}/>
        </ListItem>
      </List>
      <BlockTitle>
        <Row>
          <Col>
            {state.labels.packComponents}
          </Col>
          <Col>
            <Button small fill round iconIos="f7:add" iconAurora="f7:add" iconMd="material:add" onClick={() => props.f7router.navigate(`/addPackComponent/`)}></Button>
          </Col>
        </Row>
      </BlockTitle>
      <List>
        {componentTags}
      </List> 
      <Fab position="center-bottom" slot="fixed" text={state.labels.submit} color="green" onClick={() => handleSubmit()}>
        <Icon ios="f7:check" aurora="f7:check" md="material:done"></Icon>
      </Fab>
    </Page>
  )
}
export default AddPack
