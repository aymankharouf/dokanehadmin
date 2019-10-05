import React, { useState, useContext, useEffect } from 'react'
import { addStoreProduct } from '../data/Actions'
import {Page, Navbar, List, ListItem, ListInput, Block, Fab, Icon} from 'framework7-react';
import { StoreContext } from '../data/Store';


const AddStoreProduct = props => {
  const { state, dispatch } = useContext(StoreContext)
  const [productId, setProductId] = useState('')
  const [packId, setPackId] = useState('')
  const [productPacks, setProductPacks] = useState([])
  const [product, setProduct] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState('')
  useEffect(() => {
    if (productId) {
      setProduct(state.products.find(rec => rec.id === productId))
      setProductPacks(state.packs.filter(rec => rec.productId === productId && rec.isOffer === false))
    } else {
      setProduct('')
      setProductPacks([])
    }
  }, [productId])

  const handleSubmit = () => {
    try{
      if (productId === '') {
        throw new Error(state.labels.chooseProduct)
      }
      if (packId === '') {
        throw new Error(state.labels.choosePack)
      }
      if (quantity === '' || Number(quantity) === 0) {
        throw new Error(state.labels.enterQuantity)
      }
      const component = {
        productId,
        packId,
        quantity
      }
      const i = state.packComponents.findIndex(rec => rec.productId === component.productId && rec.packId === component.packId)
      if (i !== -1) {
        throw new Error(state.labels.sameComponentFound)
      }
      dispatch({type: 'ADD_PACK_COMPONENT', component})
      props.f7router.back()
    } catch (err) {
      setError(err.message)
    }
  }
  const productsOptionsTags = state.products.map(product => 
    <option 
      key={product.id} 
      value={product.id}
    >
      {product.name}
    </option>
  )
  const packsOptionsTags = productPacks.map(pack => 
    <option 
      key={pack.id} 
      value={pack.id}
    >
      {pack.name}
    </option>
  )
  return (
    <Page>
      <Navbar title={state.labels.addPackComponent} backLink={state.labels.back} />
      {error ? <Block strong className="error">{error}</Block> : null}
      <List form>
        <ListItem
          title={state.labels.product}
          smartSelect
          smartSelectParams={{openIn: 'popup', closeOnSelect: true, searchbar: true, searchbarPlaceholder: 'Search product'}}
        >
          <select name="productId" defaultValue="" onChange={(e) => setProductId(e.target.value)}>
            <option value="" disabled></option>
            {productsOptionsTags}
          </select>
        </ListItem>
        <ListItem
          title={state.labels.pack}
          smartSelect
          smartSelectParams={{openIn: 'popup', closeOnSelect: true, searchbar: true, searchbarPlaceholder: 'Search pack'}}
        >
          <select name="packId" defaultValue="" onChange={(e) => setPackId(e.target.value)}>
            <option value="" disabled></option>
            {packsOptionsTags}
          </select>
        </ListItem>
        <ListInput 
          name="quantity" 
          label={state.labels.quantity}
          value={quantity}
          clearButton
          floatingLabel 
          type="number" 
          onChange={(e) => setQuantity(e.target.value)}
          onInputClear={() => setQuantity('')}
        />
        <img src={product.imageUrl} alt=""/>
      </List>
      <Fab position="center-bottom" slot="fixed" text={state.labels.submit} color="green" onClick={() => handleSubmit()}>
        <Icon ios="f7:check" aurora="f7:check" md="material:done"></Icon>
      </Fab>
    </Page>
  )
}
export default AddStoreProduct
