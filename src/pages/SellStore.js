import React, { useState, useContext, useEffect, useMemo } from 'react'
import { Page, Navbar, List, ListItem, ListInput, Fab, Icon } from 'framework7-react'
import { StoreContext } from '../data/store'
import { addStockTrans, showMessage, showError, getMessage } from '../data/actions'
import labels from '../data/labels'

const SellStore = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [storeId, setStoreId] = useState('')
  const stores = useMemo(() => state.stores.filter(s => s.id !== 's')
  , [state.stores])
  const pack = useMemo(() => state.packs.find(p => p.id === props.id)
  , [state.packs, props.id])
  const product = useMemo(() => state.products.find(p => p.id === pack.productId)
  , [state.products, pack])
  const packStock = useMemo(() => state.storePacks.find(p => p.packId === props.id && p.storeId === 's')
  , [state.storePacks, props.id])
  const profit = useMemo(() => parseInt(price * quantity * 1000) - parseInt(packStock.cost * quantity)
  , [packStock, price, quantity])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])

  const handleSubmit = async () => {
    try{
      if (Number(price) <= 0) {
        throw new Error('invalidPrice')
      }
      if (Number(quantity) <= 0 || Number(quantity) > packStock.quantity) {
        throw new Error('invalidValue')
      }
      await addStockTrans('c', pack.id, Number(quantity), packStock.cost, Number(price), state.storePacks, state.packs, storeId)
      showMessage(labels.addSuccess)
      props.f7router.back()
    } catch(err) {
    	setError(getMessage(props, err))
    }
  }

  return (
    <Page>
      <Navbar title={`${labels.sell} ${product.name}-${pack.name}`} backLink={labels.back} />
      <List form>
        <ListItem
          title={labels.store}
          smartSelect
          smartSelectParams={{
            openIn: "popup", 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close
          }}
        >
          <select name="storeId" value={storeId} onChange={e => setStoreId(e.target.value)}>
            <option value=""></option>
            {stores.map(s => 
              <option key={s.id} value={s.id}>{s.name}</option>
            )}
          </select>
        </ListItem>
        <ListInput 
          name="price" 
          label={labels.price}
          value={price}
          clearButton 
          floatingLabel 
          type="number" 
          onChange={e => setPrice(e.target.value)}
          onInputClear={() => setPrice('')}
        />
        <ListInput 
          name="quantity" 
          label={labels.quantity}
          value={quantity}
          clearButton 
          floatingLabel 
          type="number" 
          onChange={e => setQuantity(e.target.value)}
          onInputClear={() => setQuantity('')}
        />
        {!price || !quantity ? '' : 
          <ListInput 
            name="profit" 
            label={labels.profitTitle}
            value={(profit / 1000).toFixed(3)}
            floatingLabel 
            type="number" 
            readonly
          />
        }
      </List>
      {!storeId || !price || !quantity ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
      
    </Page>
  )
}
export default SellStore
