import React, { useState, useContext, useEffect, useMemo } from 'react'
import { addStorePack, showMessage, showError, getMessage } from '../data/Actions'
import { Page, Navbar, List, ListItem, ListInput, Fab, Icon } from 'framework7-react';
import { StoreContext } from '../data/Store';

const AddStorePack = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [productId, setProductId] = useState('')
  const [packId, setPackId] = useState('')
  const [productPacks, setProductPacks] = useState([])
  const [product, setProduct] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [price, setPrice] = useState('')
  const [offerDays, setOfferDays] = useState('')
  const store = useMemo(() => state.stores.find(s => s.id === props.id)
  , [state.stores, props.id])
  const products = useMemo(() => {
    const products = state.products.filter(p => p.isActive)
    return products.sort((p1, p2) => p1.name > p2.name ? 1 : -1)
  }, [state.products])
  useEffect(() => {
    if (productId) {
      setProduct(state.products.find(p => p.id === productId))
      setProductPacks(state.packs.filter(p => p.productId === productId))
    } else {
      setProduct('')
      setProductPacks([])
    }
  }, [state.packs, state.products, productId])
  useEffect(() => {
    if (error) {
      showError(props, error)
      setError('')
    }
  }, [error, props])

  const handleSubmit = async () => {
    try{
      if (state.storePacks.find(p => p.packId === packId && p.storeId === store.id)) {
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
        packId, 
        storeId: store.id,
        purchasePrice: store.type === '5' ? parseInt(purchasePrice * 1000) : parseInt(price * 1000),
        price: parseInt(price * 1000),
        offerEnd,
        time: new Date()
      }
      const pack = state.packs.find(p => p.id === packId)
      await addStorePack(storePack, pack, state.storePacks)
      showMessage(props, state.labels.addSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(err, state.labels, props.f7route.route.component.name))
		}
  }

  return (
    <Page>
      <Navbar title={`${state.labels.addProduct} - ${store.name}`} backLink={state.labels.back} />
      <List form>
        <ListItem
          title={state.labels.product}
          smartSelect
          smartSelectParams={{
            openIn: 'popup', 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: state.labels.search,
            popupCloseLinkText: state.labels.close
          }}
        >
          <select name="productId" defaultValue="" onChange={e => setProductId(e.target.value)}>
            <option value=""></option>
            {products.map(p => 
              <option key={p.id} value={p.id}>{p.name}</option>
            )}
          </select>
        </ListItem>
        <ListItem
          title={state.labels.pack}
          smartSelect
          smartSelectParams={{
            openIn: 'popup', 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: state.labels.search,
            popupCloseLinkText: state.labels.close
          }}
        >
          <select name="packId" defaultValue="" onChange={e => setPackId(e.target.value)}>
            <option value=""></option>
            {productPacks.map(p => 
              <option key={p.id} value={p.id}>{p.name}</option>
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
          : ''
        }
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
        <img src={product.imageUrl} className="img-card" alt={product.name} />
      </List>
      {!productId || !packId || !price ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
      
    </Page>
  )
}
export default AddStorePack
