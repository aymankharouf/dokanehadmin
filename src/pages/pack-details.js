import React, { useContext, useState, useEffect } from 'react'
import { f7, Page, Navbar, Card, CardContent, CardFooter, List, ListItem, Icon, Fab, Toolbar, Badge, FabButton, FabButtons } from 'framework7-react'
import { StoreContext } from '../data/store'
import { refreshPackPrice, deletePack, showMessage, showError, getMessage, quantityText } from '../data/actions'
import BottomToolbar from './bottom-toolbar'
import PackImage from './pack-image'
import moment from 'moment'
import labels from '../data/labels'

const PackDetails = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
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
  useEffect(() => {
    if (inprocess) {
      f7.dialog.preloader(labels.inprocess)
    } else {
      f7.dialog.close()
    }
  }, [inprocess])

  const handleRefreshPrice = async () => {
    try{
      setInprocess(true)
      await refreshPackPrice(pack, state.packPrices, state.packs)
      setInprocess(false)
      showMessage(labels.refreshSuccess)
    } catch(err) {
      setInprocess(false)
			setError(getMessage(props, err))
		}
  }
  const handleDelete = () => {
    f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, async () => {
      try{
        setInprocess(true)
        await deletePack(pack.id)
        setInprocess(false)
        showMessage(labels.deleteSuccess)
        props.f7router.back()
      } catch(err) {
        setInprocess(false)
        setError(getMessage(props, err))
      }
    })
  }
  return (
    <Page>
      <Navbar title={`${pack.productName}${pack.productAlias ? '-' + pack.productAlias : ''}`} backLink={labels.back} />
      <Card>
        <CardContent>
          <div className="card-title">{pack.name}</div>
          <PackImage pack={pack} type="card" />
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
          key={s.id}
        >
          {s.offerEnd ? <div className="list-subtext1">{labels.offerUpTo}: {moment(s.offerEnd.toDate()).format('Y/M/D')}</div> : ''}
          {s.isOffer ? 
            <Badge slot="title" color='green'>{labels.offer}</Badge> 
          : ''}
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
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default PackDetails
