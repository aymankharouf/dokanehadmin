import React, { useState, useContext, useEffect, useMemo } from 'react'
import { addStorePack, showMessage, showError, getMessage } from '../data/Actions'
import { Page, Navbar, List, ListItem, ListInput, Fab, Icon } from 'framework7-react';
import { StoreContext } from '../data/Store';

const AddPackStore = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [cost, setCost] = useState('')
  const [price, setPrice] = useState('')
  const [offerDays, setOfferDays] = useState('')
  const [storeId, setStoreId] = useState('')
  const [store, setStore] = useState('')
  const [quantity, setQuantity] = useState('')
  const stores = useMemo(() => state.stores.filter(s => s.id !== 's')
  , [state.stores])
  const pack = useMemo(() => state.packs.find(p => p.id === props.id)
  , [state.packs, props.id])
  const product = useMemo(() => state.products.find(p => p.id === pack.productId)
  , [state.products, pack])
  useEffect(() => {
    if (error) {
      showError(props, error)
      setError('')
    }
  }, [error, props])
  useEffect(() => {
    if (storeId) {
      setStore(state.stores.find(s => s.id === storeId))
    }
  }, [state.stores, storeId])
  const getDefaultPrice = () => {
    if (cost && quantity) {
      setPrice((cost / quantity * (100 + state.labels.profit) / 100).toFixed(3))
    }
  }
  const handleSubmit = async () => {
    try{
      if (state.storePacks.find(p => p.packId === pack.id && p.storeId === storeId)) {
        throw new Error('duplicatePackInStore')
      }
      if (Number(price) <= 0) {
        throw new Error('invalidPrice')
      }
      if (offerDays && Number(offerDays) <= 0) {
        throw new Error('invalidPeriod')
      }
      let offerEnd = ''
      if (offerDays) {
        offerEnd = new Date()
        offerEnd.setDate(offerEnd.getDate() + Number(offerDays))
      }
      const storePack = {
        packId: pack.id, 
        storeId,
        cost: store.type === '5' ? cost * 1000 : price * 1000,
        price: price * 1000,
        quantity: Number(quantity),
        offerEnd,
        time: new Date()
      }
      await addStorePack(storePack, pack, state.storePacks)
      showMessage(props, state.labels.addSuccess)
      props.f7router.back()
    } catch(err) {
    	setError(getMessage(props, err))
    }
  }

  return (
    <Page>
      <Navbar title={`${state.labels.addPrice} ${product.name} ${pack.name}`} backLink={state.labels.back} className="page-title" />
      <List form>
        <ListItem
          title={state.labels.store}
          smartSelect
          smartSelectParams={{
            openIn: "popup", 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: state.labels.search,
            popupCloseLinkText: state.labels.close
          }}
        >
          <select name="storeId" value={storeId} onChange={e => setStoreId(e.target.value)}>
            <option value=""></option>
            {stores.map(s => 
              <option key={s.id} value={s.id}>{s.name}</option>
            )}
          </select>
        </ListItem>
        {store.type === '5' ? 
          <ListInput 
            name="puchasePrice" 
            label={state.labels.cost}
            value={cost}
            clearButton
            floatingLabel 
            type="number" 
            onChange={e => setCost(e.target.value)}
            onInputClear={() => setCost('')}
            onBlur={() => getDefaultPrice()}
          />
        : ''}
        {store.type === '5' ? 
          <ListInput 
            name="quantity" 
            label={state.labels.quantity}
            value={quantity}
            clearButton
            floatingLabel 
            type="number" 
            onChange={e => setQuantity(e.target.value)}
            onInputClear={() => setQuantity('')}
            onBlur={() => getDefaultPrice()}
          />
        : ''}
        <ListInput 
          name="price" 
          label={state.labels.price}
          value={price}
          clearButton 
          floatingLabel 
          type="number" 
          onChange={e => setPrice(e.target.value)}
          onInputClear={() => setPrice('')}
        />
        <ListInput 
          name="offerDays" 
          label={state.labels.offerDays}
          value={offerDays}
          clearButton 
          floatingLabel 
          type="number" 
          onChange={e => setOfferDays(e.target.value)}
          onInputClear={() => setOfferDays('')}
        />
      </List>
      {!storeId || !price || (store.type === '5' && (!cost || !quantity)) ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
      
    </Page>
  )
}
export default AddPackStore
