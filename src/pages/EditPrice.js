import React, {useState, useContext, useEffect } from 'react'
import {Page, Navbar, List, ListItem, ListInput, Button, Block, Toggle} from 'framework7-react';
import { StoreContext } from '../data/Store';
import { editPrice } from '../data/Actions'


const EditPrice = props => {
  const { state, products } = useContext(StoreContext)
  const product = products.find(rec => rec.id === props.productId)
  let store = product.stores.find(rec => rec.id === props.storeId)
  store = {...store, name: state.stores.find(rec => rec.id === props.storeId).name}
  const [purchasePrice, setPurchasePrice] = useState(store.purchasePrice || '')
  const [price, setPrice] = useState(store.price || '')
  const initOfferEnd = store.offerEnd ? [store.offerEnd.toDate()] : ''
  const [offerEnd, setOfferEnd] = useState(initOfferEnd || '')
  const [error, setError] = useState('')
  useEffect(() => {
    const storeType = store ? store.storeType : null
    if (storeType === 'w') {
      const currentCategory = state.categories.find(rec => rec.id === product.category)
      const currentSection = currentCategory ? state.sections.find(rec => rec.id === currentCategory.section) : null
      const percent = currentSection ? currentSection.percent : 0
      setPrice(parseFloat((1 + (percent / 100)) * purchasePrice).toFixed(3))
    } else {
      setPrice(purchasePrice)
    }
  }, [purchasePrice])
  const handleEdit = () => {
    try{
      if (purchasePrice === '') {
        throw 'enter purchase price'
      }
      if (price === '') {
        throw 'enter price'
      }
      if (price < purchasePrice) {
        throw 'enter a valid price'
      }
      if (offerEnd.length > 0 && new Date(offerEnd) < new Date()) {
        throw 'enter a valid offer end date'
      }
      const oldPurchasePrice = store.offerEnd ? store.oldPurchasePrice || '' : store.purchasePrice
      const oldPrice = store.offerEnd ? store.oldPrice || '' : store.price
      const offerEndDate = offerEnd.length > 0 ? new Date(offerEnd) : ''
      editPrice(
        store,
        product,
        purchasePrice,
        price,
        oldPurchasePrice,
        oldPrice,
        offerEndDate 
      ).then(() => {
        props.f7router.back()
      })  
    } catch (err){
      setError(err)
    }
  }
  return (
    <Page>
      <Navbar title={`Edit Price - ${store.name}`} backLink="Back" />
      <List form>
        <img src={product.imageUrl} alt=""/>
        <ListInput 
          name="purchasePrice" 
          label="Purchase Price" 
          clearButton 
          floatingLabel 
          type="number" 
          value={purchasePrice} 
          onChange={(e) => setPurchasePrice(e.target.value)}
          onInputClear={() => setPurchasePrice('')}
        />
        <ListInput 
          name="price" 
          label="Price" 
          clearButton 
          floatingLabel 
          type="number" 
          value={price} 
          onChange={(e) => setPrice(e.target.value)}
          onInputClear={() => setPrice('')}
        />
        <ListInput
          name="offerEnd"
          label="Offer End"
          type="datepicker"
          clearButton
          value={offerEnd} 
          onCalendarChange={(value) => setOfferEnd(value)}
          onInputClear={() => setOfferEnd([])}
        />
        <Button fill onClick={(e) => handleEdit(e)}>Submit</Button>
      </List>
      <Block strong className="error">
        <p>{error}</p>
      </Block>
    </Page>
  )
}
export default EditPrice
