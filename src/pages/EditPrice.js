import React, {useState, useContext, useEffect } from 'react'
import {Page, Navbar, List, ListInput, Block, Fab, Icon} from 'framework7-react';
import { StoreContext } from '../data/Store';
import { editPrice } from '../data/Actions'


const EditPrice = props => {
  const { state, products } = useContext(StoreContext)
  const product = products.find(rec => rec.id === props.productId)
  let store = product.stores.find(rec => rec.id === props.storeId)
  store = {...store, name: state.stores.find(rec => rec.id === props.storeId).name}
  const [purchasePrice, setPurchasePrice] = useState(store.purchasePrice / 1000)
  const [price, setPrice] = useState(store.price / 1000)
  const initOfferEnd = store.offerEnd ? [store.offerEnd.toDate()] : ''
  const [offerEnd, setOfferEnd] = useState(initOfferEnd)
  const [error, setError] = useState('')
  useEffect(() => {
    const storeType = store ? store.type : null
    if (storeType === 'w') {
      const currentCategory = state.categories.find(rec => rec.id === product.category)
      const currentSection = currentCategory ? state.sections.find(rec => rec.id === currentCategory.section) : null
      const percent = currentSection ? currentSection.percent : 0
      setPrice((1 + (percent / 100) * purchasePrice))
    } else {
      setPrice(purchasePrice)
    }
  }, [purchasePrice])
  const handleEdit = () => {
    try{
      if (purchasePrice === '' || Number(purchasePrice) === 0) {
        throw new Error(state.labels.enterPurchasePrice)
      }
      if (price === '' || Number(price) === 0) {
        throw new Error(state.labels.enterPrice)
      }
      if (price * 1000 < purchasePrice * 1000) {
        throw new Error(state.labels.invalidPrice)
      }
      if (offerEnd.length > 0 && new Date(offerEnd) < new Date()) {
        throw new Error(state.labels.invalidOfferEnd)
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
      setError(err.message)
    }
  }
  return (
    <Page>
      <Navbar title={`${state.labels.editPrice} - ${store.name}`} backLink="Back" />
      {error ? <Block strong className="error">{error}</Block> : null}
      <List form>
        <img src={product.imageUrl} alt=""/>
        <ListInput 
          name="purchasePrice" 
          label={state.labels.purchasePrice}
          clearButton 
          floatingLabel 
          type="number" 
          value={purchasePrice} 
          onChange={(e) => setPurchasePrice(e.target.value)}
          onInputClear={() => setPurchasePrice('')}
        />
        <ListInput 
          name="price" 
          label={state.labels.price}
          clearButton 
          floatingLabel 
          type="number" 
          value={price} 
          onChange={(e) => setPrice(e.target.value)}
          onInputClear={() => setPrice('')}
        />
        <ListInput
          name="offerEnd"
          label={state.labels.offerEnd}
          type="datepicker"
          clearButton
          value={offerEnd} 
          onCalendarChange={(value) => setOfferEnd(value)}
          onInputClear={() => setOfferEnd([])}
        />
      </List>
      <Fab position="center-bottom" slot="fixed" text={state.labels.submit} color="green" onClick={() => handleEdit()}>
        <Icon ios="f7:check" aurora="f7:check" md="material:done"></Icon>
      </Fab>
    </Page>
  )
}
export default EditPrice
