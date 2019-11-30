import React, { useState, useContext, useEffect, useMemo } from 'react'
import { addStorePack, showMessage, showError, getMessage } from '../data/Actions'
import { Page, Navbar, List, ListItem, ListInput, Fab, Icon } from 'framework7-react';
import { StoreContext } from '../data/Store';

const AddPackStore = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [price, setPrice] = useState('')
  const [offerDays, setOfferDays] = useState('')
  const [storeId, setStoreId] = useState('')
  const [store, setStore] = useState('')
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

  const handleSubmit = async () => {
    try{
      if (state.storePacks.find(p => p.packId === pack.id && p.storeId === storeId)) {
        throw new Error('duplicatePackInStore')
      }
      if (Number(price) <= 0) {
        throw new Error('invalidPrice')
      }
      if (store.type === '5' && Number(price) <= Number(purchasePrice)) {
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
        purchasePrice: store.type === '5' ? parseInt(purchasePrice * 1000) : parseInt(price * 1000),
        price: parseInt(price * 1000),
        offerEnd,
        time: new Date()
      }
      await addStorePack(storePack, pack, state.storePacks)
      showMessage(props, state.labels.addSuccess)
      props.f7router.back()
    } catch(err) {
    	setError(getMessage(err, state.labels, props.f7route.route.component.name))
    }
  }

  return (
    <Page>
      <Navbar title={`${state.labels.addPrice} ${product.name}-${pack.name}`} backLink={state.labels.back} />
      <List form>
        <ListItem
          title={state.labels.store}
          smartSelect
          smartSelectParams={{
            openIn: 'popup', 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: state.labels.search,
            popupCloseLinkText: state.labels.close
          }}
        >
          <select name="storeId" defaultValue="" onChange={e => setStoreId(e.target.value)}>
            <option value=""></option>
            {stores.map(s => 
              <option key={s.id} value={s.id}>{s.name}</option>
            )}
          </select>
        </ListItem>
        {store.type === '5' ? 
          <ListInput 
            name="puchasePrice" 
            label={state.labels.purchasePrice}
            value={purchasePrice}
            clearButton
            floatingLabel 
            type="number" 
            onChange={e => setPurchasePrice(e.target.value)}
            onInputClear={() => setPurchasePrice('')}
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
      {!storeId || !price ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
      
    </Page>
  )
}
export default AddPackStore
