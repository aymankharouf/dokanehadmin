import React, { useState, useContext, useEffect, useMemo } from 'react'
import { addStorePack, showMessage, showError, getMessage } from '../data/actions'
import { Page, Navbar, List, ListItem, ListInput, Fab, Icon } from 'framework7-react'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { setup } from '../data/config'

const AddStorePack = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [packId, setPackId] = useState('')
  const [cost, setCost] = useState('')
  const [price, setPrice] = useState('')
  const [offerDays, setOfferDays] = useState('')
  const store = useMemo(() => state.stores.find(s => s.id === props.id)
  , [state.stores, props.id])
  const packs = useMemo(() => {
    let packs = state.packs
    packs = packs.map(p => {
      const productInfo = state.products.find(pr => pr.id === p.productId)
      return {
        id: p.id,
        name: `${productInfo.name} ${p.name}`
      }
    })
    return packs.sort((p1, p2) => p1.name > p2.name ? 1 : -1)
  }, [state.packs, state.products]) 
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const getDefaultPrice = () => {
    if (cost && packId) {
      const pack = state.packs.find(p => p.id === packId)
      if (pack.subQuantity > 1) {
        setPrice((parseInt(cost * 1000 / pack.subQuantity) * (100 + setup.profit) / 100000).toFixed(3))
      } else {
        setPrice((cost * (100 + setup.profit) / 100).toFixed(3))
      }
    }
  }

  const handleSubmit = async () => {
    try{
      if (state.storePacks.find(p => p.packId === packId && p.storeId === store.id)) {
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
        packId, 
        storeId: store.id,
        cost: store.type === '5' ? cost * 1000 : price * 1000,
        price: price * 1000,
        offerEnd,
        time: new Date()
      }
      const pack = state.packs.find(p => p.id === packId)
      await addStorePack(storePack, pack, state.storePacks)
      showMessage(labels.addSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
		}
  }

  return (
    <Page>
      <Navbar title={`${labels.addProduct} ${store.name}`} backLink={labels.back} />
      <List form>
        <ListItem
          title={labels.pack}
          smartSelect
          smartSelectParams={{
            openIn: "popup", 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close
          }}
        >
          <select name="packId" value={packId} onChange={e => setPackId(e.target.value)}>
            <option value=""></option>
            {packs.map(p => 
              <option key={p.id} value={p.id}>{p.name}</option>
            )}
          </select>
        </ListItem>
        {store.type === '5' ? 
          <ListInput 
            name="cost" 
            label={labels.cost}
            value={cost}
            clearButton
            floatingLabel 
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
          floatingLabel 
          type="number" 
          onChange={e => setPrice(e.target.value)}
          onInputClear={() => setPrice('')}
        />
        <ListInput 
          name="offerDays" 
          label={labels.offerDays}
          value={offerDays}
          clearButton 
          floatingLabel 
          type="number" 
          onChange={e => setOfferDays(e.target.value)}
          onInputClear={() => setOfferDays('')}
        />
      </List>
      {!packId || !price || (store.type === '5' && !cost) ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
      
    </Page>
  )
}
export default AddStorePack
