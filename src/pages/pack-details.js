import React, { useContext, useState, useMemo, useEffect } from 'react'
import { f7, Page, Navbar, Card, CardContent, CardFooter, List, ListItem, Icon, Fab, Toolbar, Badge, FabButton, FabButtons, Button } from 'framework7-react'
import { StoreContext } from '../data/store'
import { refreshPackPrice, showMessage, showError, getMessage, quantityText } from '../data/actions'
import BottomToolbar from './bottom-toolbar'
import PackImage from './pack-image'
import moment from 'moment'
import labels from '../data/labels'

const PackDetails = props => {
  const { state, dispatch } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const pack = useMemo(() => state.packs.find(p => p.id === props.id)
  , [state.packs, props.id])
  const packStores = useMemo(() => {
    let packStores = state.storePacks.filter(p => (p.packId === pack.id || state.packs.find(pa => pa.id === p.packId && (pa.subPackId === pack.id || pa.bonusPackId === pack.id))))
    packStores = packStores.map(s => {
      let packId, unitPrice, quantity, offerInfo, isOffer, price
      if (s.packId === pack.id) {
        packId = s.packId
        if (s.cost === s.price || s.storeId === 's') { // for type 5 get total price not unit price
          price = s.price
          unitPrice = s.price
        } else {
          price = s.cost
          unitPrice = s.price
        }
        unitPrice = s.price 
        quantity = s.quantity
        isOffer = false
      } else {
        offerInfo = state.packs.find(p => p.id === s.packId && p.subPackId === pack.id)
        if (offerInfo) {
          packId = offerInfo.id
          if (s.cost === s.price || s.storeId === 's') { // for type 5 get cost as total price not unit price
            unitPrice = parseInt(s.price / offerInfo.subQuantity * offerInfo.subPercent)
            price = s.price
            isOffer = true
          } else {
            unitPrice = s.price
            price = s.cost
            isOffer = false
          }
          quantity = offerInfo.subQuantity
        } else {
          offerInfo = state.packs.find(p => p.id === s.packId && p.bonusPackId === pack.id)
          if (offerInfo) {
            packId = offerInfo.id
            price = s.price
            unitPrice = parseInt(s.price / offerInfo.bonusQuantity * offerInfo.bonusPercent)
            quantity = offerInfo.bonusQuantity
            isOffer = true
          }
        }
      }
      const storeInfo = state.stores.find(st => st.id === s.storeId)
      return {
        ...s,
        storeInfo,
        packId,
        quantity,
        price,
        unitPrice,
        isOffer
      }
    })
    packStores = packStores.filter(s => s.packId)
    const today = new Date()
    today.setDate(today.getDate() - 30)
    return packStores.sort((s1, s2) => 
    {
      if (s1.unitPrice === s2.unitPrice) {
        const store1 = state.stores.find(s => s.id === s1.storeId)
        const store2 = state.stores.find(s => s.id === s2.storeId)
        if (store1.type === store2.type){
          if (store2.discount === store1.discount) {
            const store1Purchases = state.purchases.filter(p => p.storeId === s1.storeId && p.time.toDate() < today)
            const store2Purchases = state.purchases.filter(p => p.storeId === s2.storeId && p.time.toDate() < today)
            const store1Sales = store1Purchases.reduce((sum, p) => sum + p.total, 0)
            const store2Sales = store2Purchases.reduce((sum, p) => sum + p.total, 0)
            return store1Sales - store2Sales
          } else {
            return Number(store2.discount) - Number(store1.discount)
          }
        } else {
          return Number(store1.type) - Number(store2.type)
        }
      } else {
        return s1.unitPrice - s2.unitPrice
      }
    })
  }, [pack, state.stores, state.storePacks, state.purchases, state.packs])
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

  const handlePurchase = packStore => {
		try{
      if (packStore.offerEnd && new Date() > packStore.offerEnd.toDate()) {
        throw new Error('offerEnded')
      }
			if (state.basket.storeId && state.basket.storeId !== packStore.storeId){
				throw new Error('twoDiffStores')
      }
      if (state.basket.packs && state.basket.packs.find(p => p.packId === packStore.packId)) {
        throw new Error('duplicatePacKInBasket')
      }
      const packInfo = state.packs.find(p => p.id === packStore.packId)
      let params
      if (packInfo.byWeight) {
        f7.dialog.prompt(labels.enterWeight, labels.actualWeight, async weight => {
          params = {
            pack: packInfo,
            packStore,
            quantity : packInfo.isDivided ? Number(weight) : 1,
            price: packStore.price,
            orderId: props.orderId,
            weight: Number(weight),
          }
          dispatch({type: 'ADD_TO_BASKET', params})
          showMessage(labels.addToBasketSuccess)
          props.f7router.back()
        })
      } else {
        params = {
          pack: packInfo, 
          packStore,
          quantity: 1,
          price: packStore.price,
          orderId: props.orderId,
        }
        dispatch({type: 'ADD_TO_BASKET', params})
        showMessage(labels.addToBasketSuccess)
        props.f7router.back()
      }
    } catch(err) {
			setError(getMessage(props, err))
		}
	}
  const handleRefreshPrice = async () => {
    try{
      setInprocess(true)
      await refreshPackPrice(pack, state.storePacks, state.packs)
      setInprocess(false)
      showMessage(labels.refreshSuccess)
    } catch(err) {
      setInprocess(false)
			setError(getMessage(props, err))
		}
  }
  return (
    <Page>
      <Navbar title={pack.productName} backLink={labels.back} />
      <Card>
        <CardContent>
          <div className="card-title">{pack.name}</div>
          <PackImage pack={pack} type="card" />
        </CardContent>
        <CardFooter>
          <p>{(pack.price / 1000).toFixed(3)}</p>
        </CardFooter>
      </Card>
      <List mediaList>
      {packStores.map(s => 
        <ListItem 
          title={s.storeInfo.name}
          subtitle={`${labels.unitPrice}: ${(s.unitPrice / 1000).toFixed(3)}`}
          text={`${labels.price}: ${(s.price / 1000).toFixed(3)}`}
          footer={s.quantity > 0 ? `${labels.quantity}: ${quantityText(s.quantity)}` : ''}
          key={s.id}
        >
          {s.offerEnd ? <div className="list-subtext1">{labels.offerUpTo}: {moment(s.offerEnd.toDate()).format('Y/M/D')}</div> : ''}
          {s.isOffer ? 
            <Badge slot="title" color='green'>{labels.offer}</Badge> 
          : ''}
          {s.storeId === 's' ? '' :
            <Button text={labels.purchase} slot="after" onClick={() => handlePurchase(s)} />
          }
        </ListItem>
      )}
      </List>
      <Fab position="left-top" slot="fixed" color="orange" className="top-fab">
        <Icon material="keyboard_arrow_down"></Icon>
        <Icon material="close"></Icon>
        <FabButtons position="bottom">
          <FabButton color="green" onClick={() => props.f7router.navigate(`/add-pack-store/${props.id}`)}>
            <Icon material="add"></Icon>
          </FabButton>
          <FabButton color="blue" onClick={() => props.f7router.navigate(`/${pack.isOffer ? 'edit-offer' : (pack.subPackId ? 'edit-bulk' : 'edit-pack')}/${props.id}`)}>
            <Icon material="edit"></Icon>
          </FabButton>
          <FabButton color="yellow" onClick={() => handleRefreshPrice()}>
            <Icon material="cached"></Icon>
          </FabButton>
          <FabButton color="red" onClick={() => props.f7router.navigate(`/pack-trans/${props.id}`)}>
            <Icon material="import_export"></Icon>
          </FabButton>
        </FabButtons>
      </Fab>

      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default PackDetails
