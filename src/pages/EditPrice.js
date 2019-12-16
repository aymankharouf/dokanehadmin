import React, { useState, useContext, useEffect, useMemo } from 'react'
import { Page, Navbar, List, ListInput, Card, CardContent, CardHeader, Fab, Icon } from 'framework7-react';
import { StoreContext } from '../data/Store';
import { editPrice, showMessage, showError, getMessage } from '../data/Actions'


const EditPrice = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const storePack = useMemo(() => state.storePacks.find(p => p.id === props.id)
  , [state.storePacks, props.id])
  const pack = useMemo(() => state.packs.find(p => p.id === storePack.packId)
  , [state.packs, storePack])
  const product = useMemo(() => state.products.find(p => p.id === pack.productId)
  , [state.products, pack])
  const store = useMemo(() => state.stores.find(s => s.id === storePack.storeId)
  , [state.stores, storePack])
  const [purchasePrice, setPurchasePrice] = useState('')
  const [price, setPrice] = useState('')
  const [offerDays, setOfferDays] = useState('')
  const [quantity, setQuantity] = useState('')
  useEffect(() => {
    if (error) {
      showError(props, error)
      setError('')
    }
  }, [error, props])

  const handleEdit = async () => {
    try{
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
      const newStorePack = {
        ...storePack,
        price: price * 1000,
        purchasePrice: store.type === '5' ? purchasePrice * 1000 : price * 1000,
        quantity,
        offerEnd,
        time: new Date()
      }
      await editPrice(newStorePack, storePack.price, pack, state.storePacks)
      showMessage(props, state.labels.editSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(err, state.labels, props.f7route.route.component.name))
		}
  }
  return (
    <Page>
      <Navbar title={`${state.labels.editPrice} - ${store.name}`} backLink={state.labels.back} />
      <Card>
        <CardHeader>
          <p>{product.name}</p>
          <p>{pack.name}</p>
        </CardHeader>
        <CardContent>
          <img src={product.imageUrl} className="img-card" alt={product.name} />
        </CardContent>
      </Card>
      <List form>
        {store.type === '5' ? 
          <ListInput 
            name="purchasePrice" 
            label={state.labels.purchasePrice}
            clearButton 
            floatingLabel 
            type="number" 
            value={purchasePrice}
            onChange={e => setPurchasePrice(e.target.value)}
            onInputClear={() => setPurchasePrice('')}
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
          />
        : ''}
        <ListInput 
          name="price" 
          label={state.labels.price}
          clearButton 
          floatingLabel 
          type="number" 
          value={price} 
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
      {!price || (store.type === '5' && (!purchasePrice || !quantity)) ? '' :
        <Fab position="left-top" slot="fixed" color="green" onClick={() => handleEdit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default EditPrice
