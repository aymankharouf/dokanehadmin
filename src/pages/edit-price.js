import React, { useState, useContext, useEffect, useMemo } from 'react'
import { f7, Page, Navbar, List, ListInput, Card, CardContent, CardHeader, Fab, Icon } from 'framework7-react'
import { StoreContext } from '../data/store'
import { editPrice, showMessage, showError, getMessage } from '../data/actions'
import PackImage from './pack-image'
import labels from '../data/labels'
import { setup } from '../data/config'

const EditPrice = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const storePack = useMemo(() => state.storePacks.find(p => p.id === props.id)
  , [state.storePacks, props.id])
  const pack = useMemo(() => state.packs.find(p => p.id === storePack.packId)
  , [state.packs, storePack])
  const store = useMemo(() => state.stores.find(s => s.id === storePack.storeId)
  , [state.stores, storePack])
  const [cost, setCost] = useState('')
  const [price, setPrice] = useState('')
  const [offerDays, setOfferDays] = useState('')
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

  const getDefaultPrice = () => {
    if (cost) {
      if (pack.subQuantity > 1) {
        setPrice((parseInt(cost * 1000 / pack.subQuantity) * (100 + setup.profit) / 100000).toFixed(3))
      } else {
        setPrice((cost * (100 + setup.profit) / 100).toFixed(3))
      }
    }
  }
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
        cost: store.type === '5' ? cost * 1000 : price * 1000,
        offerEnd
      }
      setInprocess(true)
      await editPrice(newStorePack, storePack.price, pack, state.storePacks, state.packs)
      setInprocess(false)
      showMessage(labels.editSuccess)
      props.f7router.back()
    } catch(err) {
      setInprocess(false)
			setError(getMessage(props, err))
		}
  }
  return (
    <Page>
      <Navbar title={`${labels.editPrice} ${store.name}`} backLink={labels.back} />
      <Card>
        <CardHeader>
          <p>{pack.productName}</p>
          <p>{pack.name}</p>
        </CardHeader>
        <CardContent>
          <PackImage pack={pack} type="card" />
        </CardContent>
      </Card>
      <List form>
        {store.type === '5' ? 
          <ListInput 
            name="cost" 
            label={labels.cost}
            clearButton 
            floatingLabel 
            type="number" 
            value={cost}
            onChange={e => setCost(e.target.value)}
            onInputClear={() => setCost('')}
            onBlur={() => getDefaultPrice()}
          />
        : ''}
        <ListInput 
          name="price" 
          label={labels.price}
          clearButton 
          floatingLabel 
          type="number" 
          value={price} 
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
      {!price || (store.type === '5' && !cost) ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleEdit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default EditPrice
