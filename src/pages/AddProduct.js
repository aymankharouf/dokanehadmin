import React, { useState, useContext } from 'react'
import { addProduct } from '../data/Actions'
import {Page, Navbar, List, ListItem, ListInput, Button, Block} from 'framework7-react';
import { StoreContext } from '../data/Store';


const AddProduct = props => {
  const { state, stores, products } = useContext(StoreContext)
  const nonStoreProducts = products.filter(rec => rec.stores.findIndex(store => store.id === props.id) === -1)
  const store = stores.find(rec => rec.id === props.id)
  const [productId, setProductId] = useState('')
  const [product, setProduct] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [price, setPrice] = useState('')
  const [error, setError] = useState('')
  const handleSubmit = () => {
    try{
      if (productId === '') {
        throw 'enter product'
      }
      if (purchasePrice === '') {
        throw 'enter product purchase price'
      }
      if (price === '') {
        throw 'enter product price'
      }
      addProduct({
        product,
        storeId: props.id,
        purchasePrice,
        price
      }).then(() => {
        props.f7router.navigate(`/store/${props.id}`)
      })
    } catch (err) {
      setError(err)
    }
  }
  const handleProductChange = e => {
    setProductId(e.target.value)
    setProduct(products.find(rec => rec.id === e.target.value))
  }
  const handlePurchasePriceChange = e => {
    const storeType = store ? store.storeType : null
    if (storeType === 'w') {
      const currentCategory = state.categories.find(rec => rec.id === product.category)
      const currentSection = currentCategory ? state.sections.find(rec => rec.id === currentCategory.section) : null
      const percent = currentSection ? currentSection.percent : 0
      setPrice(parseFloat(((1 + (percent / 100)) * e.target.value)).toFixed(3))
    } else {
      setPrice(e.target.value)
    }
    setPurchasePrice(e.target.value)
  }
  const productsOptionsTags = nonStoreProducts.map(product => <option key={product.id} value={product.id}>{product.name}</option>)
  return (
    <Page>
      <Navbar title={`Add to ${store.name}`} backLink="Back" />
      <List form>
        <ListItem
          title="Product"
          smartSelect
          smartSelectParams={{openIn: 'popup', closeOnSelect: true, searchbar: true, searchbarPlaceholder: 'Search product'}}
        >
          <select name="productId" defaultValue="" onChange={(e) => handleProductChange(e)}>
            <option value="" disabled></option>
            {productsOptionsTags}
          </select>
        </ListItem>
        <img src={product.imageUrl} alt=""/>
        <ListInput name="puchasePrice" label="Puchase Price" value={purchasePrice} floatingLabel type="number" onChange={(e) => handlePurchasePriceChange(e)}/>
        <ListInput name="price" label="Price" value={price} floatingLabel type="number" onChange={(e) => setPrice(e.target.value)}/>
        <Button fill onClick={() => handleSubmit()}>Submit</Button>
        <Button href={`/newProduct/${props.id}`}>New</Button>
      </List>
      <Block strong className="error">
        <p>{error}</p>
      </Block>
    </Page>
  )
}
export default AddProduct
