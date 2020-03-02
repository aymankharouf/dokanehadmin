import React, { useState, useContext, useEffect } from 'react'
import { Page, Navbar, List, ListItem, ListInput, Fab, Icon, Toggle } from 'framework7-react'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { setup } from '../data/config'
import { addPackPrice, showMessage, showError, getMessage } from '../data/actions'

const AddPackStore = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [cost, setCost] = useState('')
  const [price, setPrice] = useState('')
  const [offerDays, setOfferDays] = useState('')
  const [isActive, setIsActive] = useState(false)
  const [storeId, setStoreId] = useState('')
  const [store, setStore] = useState('')
  const [stores] = useState(() => state.stores.filter(s => s.id !== 's'))
  const [pack] = useState(() => state.packs.find(p => p.id === props.id))
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  useEffect(() => {
    if (storeId) {
      setStore(state.stores.find(s => s.id === storeId))
    }
  }, [state.stores, storeId])
  useEffect(() => {
    setIsActive(store.isActive || false)
  }, [store])
  const getDefaultPrice = () => {
    if (cost) {
      if (pack.subQuantity > 1) {
        setPrice((cost / pack.subQuantity * (1 + setup.profit)).toFixed(3))
      } else {
        setPrice((cost * (1 + setup.profit)).toFixed(3))
      }
    }
  }
  const handleSubmit = () => {
    try{
      if (state.packPrices.find(p => p.packId === pack.id && p.storeId === storeId)) {
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
        offerEnd,
        isActive,
        time: new Date()
      }
      addPackPrice(storePack, state.packPrices, state.packs)
      showMessage(labels.addSuccess)
      props.f7router.back()
    } catch(err) {
    	setError(getMessage(props, err))
    }
  }

  return (
    <Page>
      <Navbar title={`${labels.addPrice} ${pack.productName} ${pack.name}`} backLink={labels.back} />
      <List form inlineLabels>
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
        {store.type === '5' ? 
          <ListInput 
            name="cost" 
            label={labels.cost}
            value={cost}
            clearButton
            type="number" 
            onChange={e => setCost(e.target.value)}
            onInputClear={() => setCost('')}
            onBlur={() => getDefaultPrice()}
          />
        : ''}
        <ListInput 
          name="price" 
          label={labels.price}
          value={price}
          clearButton 
          type="number" 
          onChange={e => setPrice(e.target.value)}
          onInputClear={() => setPrice('')}
        />
        <ListInput 
          name="offerDays" 
          label={labels.offerDays}
          value={offerDays}
          clearButton 
          type="number" 
          onChange={e => setOfferDays(e.target.value)}
          onInputClear={() => setOfferDays('')}
        />
        <ListItem>
          <span>{labels.isActive}</span>
          <Toggle 
            name="isActive" 
            color="green" 
            checked={isActive}
            onToggleChange={() => setIsActive(!isActive)}
            disabled={!store.isActive}
          />
        </ListItem>
      </List>
      {!storeId || !price || (store.type === '5' && !cost) ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
      
    </Page>
  )
}
export default AddPackStore
