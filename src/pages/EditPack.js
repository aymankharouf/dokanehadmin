import React, { useState, useContext, useEffect } from 'react'
import { editPack, deletePack } from '../data/Actions'
import {Page, Navbar, List, ListItem, ListInput, Block, Fab, Icon, Toggle, BlockTitle, Row, Col, Button} from 'framework7-react';
import { StoreContext } from '../data/Store';


const EditPack = props => {
  const { state, dispatch } = useContext(StoreContext)
  const pack = state.packs.find(rec => rec.id === props.id)
  const product = state.products.find(rec => rec.id === pack.productId)
  const [name, setName] = useState(pack.name)
  const [isOffer, setIsOffer] = useState(pack.isOffer)
  const [error, setError] = useState('')
  let i = 0
  const handleSubmit = () => {
    try{
      if (name === '') {
        throw new Error(state.labels.enterName)
      }
      const newPack = {
        ...pack,
        name,
        isOffer,
        components: state.packComponents
      }
      editPack(newPack).then(() => {
        dispatch({type: 'CLEAR_PACK_COMPONENTS'})
        props.f7router.back()
      })
    } catch (err) {
      setError(err.message)
    }
  }
  const handleDelete = () => {
    deletePack(pack).then(() => {
      props.f7router.back()
    })
  }
  useEffect(() => {
    dispatch({type: 'LOAD_PACK_COMPONENTS', components: pack.components})
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
      <Navbar title={`${state.labels.editPack} - ${product.name} ${pack.name}`} backLink="Back" />
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
      <Fab position="left-bottom" slot="fixed" color="red" onClick={() => handleDelete()}>
        <Icon ios="f7:close" aurora="f7:close" md="material:close"></Icon>
      </Fab>
    </Page>
  )
}
export default EditPack
