import React, { useState, useContext } from 'react'
import { addProduct } from '../data/Actions'
import {Page, Navbar, List, ListItem, ListInput, Button} from 'framework7-react';
import { StoreContext } from '../data/Store';


const AddProduct = props => {
  /*componentDidUpdate(){
    if (this.$f7router.currentRoute.name === 'addProduct' && this.props.result.finished && this.props.result.message === '') this.$f7router.navigate(`/storeCategory/${this.props.store.id}/category/${this.props.category.id}`)
  }*/
  const { state, products } = useContext(StoreContext)
  const nonStoreProducts = products.filter(product => product.category === props.categoryId && product.stores.findIndex(store => store.id === props.storeId) === -1)
  const category = state.categories.find(category => category.id === props.categoryId)
  const store = state.stores.find(store => store.id === props.storeId)
  const [productId, setProductId] = useState('')
  const [price, setPrice] = useState('')
  const handleSubmit = () => {
    addProduct({
      product: products.find(product => product.id === productId),
      storeId: props.storeId,
      price: price
    }).then(() => {
      props.f7router.navigate(`/storeCategory/${props.storeId}/category/${props.categoryId}`)
    })
  }
  const productsOptionsTags = nonStoreProducts.map(product => <option key={product.id} value={product.id}>{product.name}</option>)
  return (
    <Page>
      <Navbar title={`Add to ${category.name} - ${store.name}`} backLink="Back" />
      <List form>
        <ListItem
          title="Product"
          smartSelect
          smartSelectParams={{openIn: 'popup', closeOnSelect: true, searchbar: true, searchbarPlaceholder: 'Search product'}}
        >
          <select name="productId" defaultValue="" onChange={(e) => setProductId(e.target.value)}>
            <option value="" disabled></option>
            {productsOptionsTags}
          </select>
        </ListItem>
        <ListInput name="price" label="Price" floatingLabel type="number" onChange={(e) => setPrice(e.target.value)}/>
        <Button fill onClick={() => handleSubmit()}>Submit</Button>
        <Button href={`/newProduct/${props.storeId}/category/${props.categoryId}`}>New</Button>
      </List>
    </Page>
  )
}
export default AddProduct
