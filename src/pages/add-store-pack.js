import React, { useState, useContext, useEffect } from 'react'
import { Page, Navbar, List, ListItem, ListInput, Fab, Icon, Toggle } from 'framework7-react'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { addPackPrice, showMessage, showError, getMessage } from '../data/actions'

const AddStorePack = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [packId, setPackId] = useState('')
  const [cost, setCost] = useState('')
  const [offerDays, setOfferDays] = useState('')
  const [store] = useState(() => state.stores.find(s => s.id === props.id))
  const [isActive, setIsActive] = useState(store.isActive)
  const [packs] = useState(() => {
    const packs = state.packs.map(p => {
      return {
        id: p.id,
        name: `${p.productName}-${p.productAlias} ${p.name}`
      }
    })
    return packs.sort((p1, p2) => p1.name > p2.name ? 1 : -1)
  }) 
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])

  const handleSubmit = async () => {
    try{
      if (state.packPrices.find(p => p.packId === packId && p.storeId === store.id)) {
        throw new Error('duplicatePackInStore')
      }
      if (Number(cost) <= 0) {
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
      const pack = state.packs.find(p => p.id === packId)
      const packCategory = state.categories.find(c => c.id === pack.categoryId)
      let price
      if (isActive) {
        if (store.type === '5' || !store.isActive) {
          price = Math.trunc(cost * 1000 * (1 + (store.type === '5' ? packCategory.maxProfit : packCategory.minProfit)))
        } else {
          price = cost * 1000
        }
      } else {
        price = 0
      }
      const storePack = {
        packId,
        storeId: store.id,
        cost: cost * 1000,
        price,
        offerEnd,
        isActive,
        time: new Date()
      }
      addPackPrice(storePack, state.packPrices, state.packs, state.stores)
      showMessage(labels.addSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
		}
  }

  return (
    <Page>
      <Navbar title={`${labels.addProduct} ${store.name}`} backLink={labels.back} />
      <List form inlineLabels>
        <ListItem
          title={labels.product}
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
        <ListInput 
          name="cost" 
          label={labels.cost}
          value={cost}
          clearButton
          type="number" 
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
      {!packId || !cost ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
      
    </Page>
  )
}
export default AddStorePack
