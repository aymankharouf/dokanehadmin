import React, { useState, useContext, useEffect } from 'react'
import { f7, Page, Navbar, List, ListItem, ListInput, Fab, Icon } from 'framework7-react'
import { StoreContext } from '../data/store'
import { addStockTrans, showMessage, showError, getMessage } from '../data/actions'
import labels from '../data/labels'

const SellStore = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [storeId, setStoreId] = useState('')
  const [stores] = useState(() => state.stores.filter(s => s.id !== 's'))
  const [pack] = useState(() => state.packs.find(p => p.id === props.id))
  const [packStock] = useState(() => state.storePacks.find(p => p.packId === props.id && p.storeId === 's'))
  const [profit, setProfit] = useState('')
  useEffect(() => {
    setProfit(() => parseInt(price * quantity * 1000) - parseInt(packStock.cost * quantity))
  }, [packStock, price, quantity])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  useEffect(() => {
    if (inprocess) {
      f7.dialog.preloader(labels.inprocess)
    } else {
      f7.dialog.close()
    }
  }, [inprocess])

  const handleSubmit = async () => {
    try{
      if (Number(price) <= 0) {
        throw new Error('invalidPrice')
      }
      if (Number(quantity) <= 0 || Number(quantity) > packStock.quantity) {
        throw new Error('invalidValue')
      }
      setInprocess(true)
      await addStockTrans('s', pack.id, Number(quantity), packStock.cost, Number(price), state.storePacks, state.packs, storeId, state.stores)
      setInprocess(false)
      showMessage(labels.addSuccess)
      props.f7router.back()
    } catch(err) {
      setInprocess(false)
    	setError(getMessage(props, err))
    }
  }

  return (
    <Page>
      <Navbar title={`${labels.sell} ${pack.productName} ${pack.name}`} backLink={labels.back} />
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
            label={labels.profit}
            value={(profit / 1000).toFixed(3)}
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
