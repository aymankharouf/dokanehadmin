import React, { useContext, useState, useEffect, useRef } from 'react'
import { f7, Page, Navbar, Card, CardContent, CardFooter, Link, List, ListItem, Icon, Fab, Toolbar, Badge, FabButton, FabButtons, FabBackdrop, Actions, ActionsButton } from 'framework7-react'
import { StoreContext } from '../data/store'
import { deleteStorePack, haltOffer, refreshPackPrice, deletePack, changeStorePackStatus, showMessage, showError, getMessage, quantityText } from '../data/actions'
import BottomToolbar from './bottom-toolbar'
import moment from 'moment'
import labels from '../data/labels'

const PackDetails = props => {
  const { state, dispatch } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [currentStorePack, setCurrentStorePack] = useState('')
  const actionsList = useRef('')
  const [pack, setPack] = useState(() => {
    const pack = state.packs.find(p => p.id === props.id)
    let detailsCount = state.packPrices.filter(p => p.packId === pack.id).length
    detailsCount = detailsCount === 0 ? state.orders.filter(o => o.basket.find(p => p.packId === pack.id)).length : detailsCount
    return {
      ...pack,
      detailsCount
    }
  })
  const [packStores, setPackStores] = useState([])
  useEffect(() => {
    setPackStores(() => {
      let packStores = state.packPrices.filter(p => (p.packId === pack.id || state.packs.find(pa => pa.id === p.packId && (pa.subPackId === pack.id || pa.bonusPackId === pack.id))))
      packStores = packStores.map(s => {
        let packId, unitPrice, quantity, offerInfo, isOffer, price
        if (s.packId === pack.id) {
          packId = s.packId
          if (s.cost === s.price || s.storeId === 's') { // for type 5 get total price not unit price
            price = s.price
          } else {
            price = s.cost
          }
          unitPrice = s.price 
          quantity = s.quantity
          isOffer = false
        } else {
          offerInfo = state.packs.find(p => p.id === s.packId && p.subPackId === pack.id)
          if (offerInfo) {
            packId = offerInfo.id
            if (s.cost === s.price || s.storeId === 's') { // for type 5 get cost as total price not unit price
              unitPrice = Math.trunc(s.price / offerInfo.subQuantity * offerInfo.subPercent)
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
              unitPrice = Math.trunc(s.price / offerInfo.bonusQuantity * offerInfo.bonusPercent)
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
          isOffer,
          isActive: s.isActive
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
    })
  }, [pack, state.stores, state.packPrices, state.purchases, state.packs])
  useEffect(() => {
    setPack(() => {
      const pack = state.packs.find(p => p.id === props.id) || ''
      let detailsCount = state.packPrices.filter(p => p.packId === pack.id).length
      detailsCount = detailsCount === 0 ? state.orders.filter(o => o.basket.find(p => p.packId === pack.id)).length : detailsCount
      return {
        ...pack,
        detailsCount
      }
    })
  }, [state.packs, state.packPrices, state.orders, props.id])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleRefreshPrice = () => {
    try{
      refreshPackPrice(pack, state.packPrices, state.packs)
      showMessage(labels.refreshSuccess)
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  const handleDelete = () => {
    f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, () => {
      try{
        deletePack(pack.id)
        showMessage(labels.deleteSuccess)
        props.f7router.back()
      } catch(err) {
        setError(getMessage(props, err))
      }
    })
  }
  const handleDeletePrice = () => {
    f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, () => {
      try{
        deleteStorePack(currentStorePack, state.packPrices, state.packs)
        showMessage(labels.deleteSuccess)
      } catch(err) {
        setError(getMessage(props, err))
      }
    })
  }
  const handleHaltOffer = () => {
    try{
      const offerEndDate = new Date(currentStorePack.offerEnd)
      const today = (new Date()).setHours(0, 0, 0, 0)
      if (offerEndDate > today) {
        f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, () => {
          try{
            haltOffer(currentStorePack, state.packPrices, state.packs)
            showMessage(labels.haltSuccess)
          } catch(err) {
            setError(getMessage(props, err))
          }
        })
      } else {
        haltOffer(currentStorePack, state.packPrices, state.packs)
        showMessage(labels.haltSuccess)
      }
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  const handlePurchase = () => {
		try{
      if (currentStorePack.offerEnd && new Date() > currentStorePack.offerEnd.toDate()) {
        throw new Error('offerEnded')
      }
			if (state.basket.storeId && state.basket.storeId !== currentStorePack.storeId){
				throw new Error('twoDiffStores')
      }
      if (state.basket.packs?.find(p => p.packId === pack.id)) {
        throw new Error('alreadyInBasket')
      }
      let params
      if (pack.byWeight) {
        f7.dialog.prompt(labels.enterWeight, labels.actualWeight, weight => {
          params = {
            pack,
            packStore: currentStorePack,
            quantity : pack.isDivided ? Number(weight) : 1,
            price: currentStorePack.price,
            weight: Number(weight),
          }
          dispatch({type: 'ADD_TO_BASKET', params})
          showMessage(labels.addToBasketSuccess)
          props.f7router.back()
        })
      } else {
        params = {
          pack, 
          packStore: currentStorePack,
          quantity: 1,
          price: currentStorePack.price
        }
        dispatch({type: 'ADD_TO_BASKET', params})
        showMessage(labels.addToBasketSuccess)
        props.f7router.back()
      }
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  const handleChangeStatus = () => {
    try{
      changeStorePackStatus(currentStorePack, state.packPrices, state.packs)
      showMessage(labels.editSuccess)
    } catch(err) {
      setError(getMessage(props, err))
    }
  }

  const handleActions = storePackInfo => {
    const storePack = {
      packId: pack.id,
      storeId: storePackInfo.storeId,
      price: storePackInfo.price,
      cost: storePackInfo.cost,
      offerEnd: storePackInfo.offerEnd,
      isActive: storePackInfo.isActive,
      time: storePackInfo.time
    }
    setCurrentStorePack(storePack)
    actionsList.current.open()
  }
  let i = 0
  return (
    <Page>
      <Navbar title={`${pack.productName}${pack.productAlias ? '-' + pack.productAlias : ''}`} backLink={labels.back} />
      <Card>
        <CardContent>
          <div className="card-title">{pack.name}</div>
          <img src={pack.imageUrl} className="img-card" alt={labels.noImage} />
        </CardContent>
        <CardFooter>
          <p>{(pack.price / 1000).toFixed(3)}</p>
          <p>{pack.unitsCount}</p>
        </CardFooter>
      </Card>
      <List mediaList>
        {packStores.map(s => 
          <ListItem 
            title={s.storeInfo.name}
            subtitle={`${labels.unitPrice}: ${(s.unitPrice / 1000).toFixed(3)}`}
            text={`${labels.price}: ${(s.price / 1000).toFixed(3)}`}
            footer={s.quantity > 0 ? `${labels.quantity}: ${quantityText(s.quantity)}` : ''}
            key={i++}
            className={currentStorePack?.storeId === s.storeId ? 'selected' : ''}
          >
            {s.offerEnd ? <div className="list-subtext1">{labels.offerUpTo}: {moment(s.offerEnd.toDate()).format('Y/M/D')}</div> : ''}
            {s.isActive ? '' : <Badge slot="title" color='red'>{labels.inActive}</Badge>}
            {s.isOffer ? <Badge slot="text" color='green'>{labels.offer}</Badge> : ''}
            {s.isActive ? <Link slot="after" iconMaterial="more_vert" onClick={()=> handleActions(s)}/> : ''}
          </ListItem>
        )}
      </List>
      <FabBackdrop slot="fixed" />
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
          <FabButton color="pink" onClick={() => props.f7router.navigate(`/pack-trans/${props.id}`)}>
            <Icon material="import_export"></Icon>
          </FabButton>
          {pack.detailsCount === 0 ? 
            <FabButton color="red" onClick={() => handleDelete()}>
              <Icon material="delete"></Icon>
            </FabButton>
          : ''}
        </FabButtons>
      </Fab>
      <Actions ref={actionsList}>
        <ActionsButton onClick={() => handleChangeStatus()}>{currentStorePack.isActive ? labels.deactivate : labels.activate}</ActionsButton>
        {currentStorePack.storeId === 's' && currentStorePack.quantity === 0 ? '' : 
          <ActionsButton onClick={() => props.f7router.navigate(`/edit-price/${currentStorePack.packId}/store/${currentStorePack.storeId}`)}>{labels.editPrice}</ActionsButton>
        }
        {currentStorePack.storeId === 's' ? '' :
          <ActionsButton onClick={() => handleDeletePrice()}>{labels.delete}</ActionsButton>
        }
        {currentStorePack.storeId === 's' ? '' :
          <ActionsButton onClick={() => handlePurchase()}>{labels.purchase}</ActionsButton>
        }
        {currentStorePack.offerEnd && currentStorePack.price > 0 ?
          <ActionsButton onClick={() => handleHaltOffer()}>{labels.haltOffer}</ActionsButton>
        : ''}
      </Actions>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default PackDetails
