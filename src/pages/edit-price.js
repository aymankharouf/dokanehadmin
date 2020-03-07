import React, { useState, useContext, useEffect } from 'react'
import { Page, Navbar, List, ListInput, Fab, Icon } from 'framework7-react'
import { StoreContext } from '../data/store'
import { editPrice, showMessage, showError, getMessage } from '../data/actions'
import labels from '../data/labels'

const EditPrice = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [pack] = useState(() => state.packs.find(p => p.id === props.packId))
  const [store] = useState(() => state.stores.find(s => s.id === props.storeId))
  const [storePack] = useState(() => state.packPrices.find(p => p.packId === props.packId && p.storeId === props.storeId))
  const [cost, setCost] = useState('')
  const [offerDays, setOfferDays] = useState('')
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleEdit = () => {
    try{
      if (offerDays && Number(offerDays) <= 0) {
        throw new Error('invalidPeriod')
      }
      let offerEnd = ''
      if (offerDays) {
        offerEnd = new Date()
        offerEnd.setDate(offerEnd.getDate() + Number(offerDays))
      }
      const packCategory = state.categories.find(c => c.id === pack.categoryId)
      let price
      if (storePack.isActive) {
        if (store.type === '5' || !store.isActive) {
          price = Math.trunc(cost * 1000 * (1 + (store.type === '5' ? packCategory.maxProfit : packCategory.minProfit)))
        } else {
          price = cost * 1000
        }
      } else {
        price = 0
      }
      const newStorePack = {
        ...storePack,
        price,
        cost: cost * 1000,
        offerEnd,
        time: new Date()
      }
      editPrice(newStorePack, storePack.price, state.packPrices, state.packs, state.stores)
      showMessage(labels.editSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  return (
    <Page>
      <Navbar title={`${labels.editPrice} ${store.name}`} backLink={labels.back} />
      <List form inlineLabels>
        <ListInput 
          name="productName" 
          label={labels.product}
          value={pack.productName}
          type="text" 
          readonly
        />
        <ListInput 
          name="packName" 
          label={labels.pack}
          value={pack.name}
          type="text" 
          readonly
        />
        <ListInput 
          name="oldCost" 
          label={labels.oldCost}
          value={(storePack.cost / 1000).toFixed(3)}
          type="text" 
          readonly
        />
        <ListInput 
          name="cost" 
          label={labels.cost}
          clearButton 
          type="number" 
          value={cost}
          onChange={e => setCost(e.target.value)}
          onInputClear={() => setCost('')}
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
      </List>
      {!cost || Number(cost) <= 0 || cost * 1000 === storePack.cost ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleEdit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default EditPrice
