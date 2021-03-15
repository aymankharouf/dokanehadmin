import { useContext, useState, useEffect } from 'react'
import { f7, Page, Navbar, Card, CardContent, List, ListItem, CardFooter, Button, Badge, Toolbar } from 'framework7-react'
import Footer from './footer'
import { StoreContext } from '../data/store'
import { packUnavailable, showMessage, showError, getMessage, addQuantity, getPackStores } from '../data/actions'
import labels from '../data/labels'
import moment from 'moment'

const RequestedPackDetails = props => {
	const { state, dispatch } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [pack] = useState(() => state.packs.find(p => p.id === props.packId))
  const [basketStockQuantity, setBasketStockQuantity] = useState('')
  const [packStores, setPackStores] = useState([])
  useEffect(() => {
    setBasketStockQuantity(() => {
      const basketStock = state.basket.storeId === 's' && state.basket.packs.find(p => p.packId === props.packId || state.packs.find(pa => pa.id === p.packId && (pa.subPackId === props.packId || pa.bonusPackId === props.packId)))
      return (basketStock?.quantity * basketStock?.refQuantity) || 0
    })
  }, [state.basket, state.packs, props.packId])
  useEffect(() => {
    setPackStores(() => {
      const packStores = getPackStores(pack, state.packPrices, state.stores, state.packs, basketStockQuantity)
      const today = new Date()
      today.setDate(today.getDate() - 30)
      return packStores.sort((s1, s2) => 
      {
        if (s1.unitPrice === s2.unitPrice) {
          if (s1.storeInfo.type === s2.storeInfo.type){
            if (s2.storeInfo.discount === s1.storeInfo.discount) {
              const store1Purchases = state.purchases.filter(p => p.storeId === s1.storeId && p.time.toDate() >= today)
              const store2Purchases = state.purchases.filter(p => p.storeId === s2.storeId && p.time.toDate() >= today)
              const store1Sales = store1Purchases.reduce((sum, p) => sum + p.total, 0)
              const store2Sales = store2Purchases.reduce((sum, p) => sum + p.total, 0)
              return store1Sales - store2Sales
            } else {
              return Number(s2.storeInfo.discount) - Number(s1.storeInfo.discount)
            }
          } else {
            return Number(s1.storeInfo.type) - Number(s2.storeInfo.type)
          }
        } else {
          return s1.unitPrice - s2.unitPrice
        }
      })
    })
  }, [pack, state.stores, state.packPrices, state.purchases, basketStockQuantity, state.packs])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const addToBasket = (packStore, exceedPriceType) => {
    try {
      let quantity, params
      if (packStore.packInfo.byWeight) {
        f7.dialog.prompt(labels.enterWeight, labels.actualWeight, weight => {
          try{
            if (packStore.packInfo.isDivided && packStore.storeId === 's' && packStore.quantity < Number(weight)) {
              throw new Error('quantityNotAvaliable')
            }
            params = {
              pack: packStore.packInfo,
              packStore,
              refPackId: props.packId,
              refPackQuantity: 1,
              quantity: pack.isDivided ? Number(weight) : Number(props.quantity),
              price: Number(props.price),
              requested: Number(props.quantity),
              orderId: props.orderId,
              weight: Number(weight),
              exceedPriceType
            }
            dispatch({type: 'ADD_TO_BASKET', params})
            showMessage(labels.addToBasketSuccess)
            f7.views.current.router.back()
          } catch(err) {
            setError(getMessage(f7.views.current.router.currentRoute.path, err))
          }      
        })
      } else if (packStore.isAuto) {
        const mainPackInfo = state.packs.find(p => p.subPackId === packStore.packId && !p.forSale)
        const mainPackStore = state.packPrices.find(p => p.storeId === packStore.storeId && p.packId === mainPackInfo.id)
        quantity = Math.ceil(Number(props.quantity) / (packStore.quantity * mainPackInfo.subQuantity))
        params = {
          pack: mainPackInfo,
          packStore: mainPackStore,
          refPackId: props.packId,
          refPackQuantity: mainPackInfo.subQuantity,
          quantity,
          price: Number(props.price),
          exceedPriceType
        }
        dispatch({type: 'ADD_TO_BASKET', params})
        showMessage(labels.addToBasketSuccess)
        f7.views.current.router.back()
      } else {
        if (packStore.subQuantity) {
          quantity = Math.ceil(Number(props.quantity) / packStore.subQuantity)
        } else {
          quantity = Number(props.quantity)
        }
        if (packStore.storeId === 's') {
          quantity = Math.min(quantity, packStore.quantity)
        }
        params = {
          pack: packStore.packInfo,
          packStore,
          refPackId: props.packId,
          refPackQuantity: packStore.subQuantity || 1,
          quantity,
          price: Number(props.price),
          exceedPriceType
        }
        dispatch({type: 'ADD_TO_BASKET', params})
        showMessage(labels.addToBasketSuccess)
        f7.views.current.router.back()  
      }
    } catch(err) {
      setError(getMessage(f7.views.current.router.currentRoute.path, err))
    }
  }
	const handlePurchase = packStore => {
    try{
      if (state.basket.storeId && state.basket.storeId !== packStore.storeId){
        throw new Error('twoDiffStores')
      }
      const packInfo = state.packs.find(p => p.id === packStore.packId)
      if (packInfo.byWeight){
        if (state.basket.packs?.find(p => p.packId === packInfo.id && p.orderId === props.orderId)) {
          throw new Error('alreadyInBasket')
        }
      } else {
        if (state.basket.packs?.find(p => p.packId === packInfo.id)) {
          throw new Error('alreadyInBasket')
        }
      }
      if (Number(props.price) >= packStore.unitPrice) {
        addToBasket(packStore, 'n')
      } else {
        if (Number(props.price) >= pack.price) {
          f7.dialog.confirm(labels.priceHigherThanRequested, labels.confirmationTitle, () => addToBasket(packStore, 'o'))
        } else {
          f7.dialog.confirm(labels.overPricedPermission, labels.permissionTitle, () => addToBasket(packStore, 'p'))
        }
      }
    } catch(err) {
      setError(getMessage(f7.views.current.router.currentRoute.path, err))
    }
  }
  const handleUnavailable = overPriced => {
    f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, () => {
      try{
        const approvedOrders = state.orders.filter(o => ['a', 'e'].includes(o.status))
        packUnavailable(pack, Number(props.price), approvedOrders, overPriced)
        showMessage(labels.executeSuccess)
        f7.views.current.router.back()
      } catch(err) {
        setError(getMessage(f7.views.current.router.currentRoute.path, err))
      }
    })
  }
  let i = 0
  return (
    <Page>
      <Navbar title={pack.productName} backLink={labels.back} />
      <Card>
        <CardContent>
          <div className="card-title">{`${pack.name} ${pack.closeExpired ? '(' + labels.closeExpired + ')' : ''}`}</div>
          <img src={pack.imageUrl} className="img-card" alt={labels.noImage} />
        </CardContent>
        <CardFooter>
          <p>{`${labels.orderPrice}: ${(props.price / 100).toFixed(2)}, ${labels.current}: ${(pack.price / 100).toFixed(2)}`}</p>
          <p>{`${labels.quantity}: ${props.quantity}`}</p>
        </CardFooter>
      </Card>
      <List mediaList>
        {pack.price === 0 ? 
          <ListItem 
            link="#"
            title={labels.unavailable}
            onClick={() => handleUnavailable(false)}
          />
        : ''}
        {Number(props.price) > 0 && Number(props.price) < pack.price ? 
          <ListItem 
            link="#"
            title={labels.overPriced}
            onClick={() => handleUnavailable(true)}
          />
        : ''}
        {packStores.map(s => 
          <ListItem 
            title={s.storeInfo.name}
            subtitle={s.packId === pack.id ? '' : `${s.packInfo.productName}${s.packInfo.productAlias ? '-' + s.packInfo.productAlias : ''}`}
            text={s.packId === pack.id ? '' : s.packInfo.name}
            footer={addQuantity(s.quantity, -1 * basketStockQuantity) > 0 ? `${labels.balance}: ${addQuantity(s.quantity, -1 * basketStockQuantity)}` : ''}
            key={i++}
          >
            <div className="list-subtext1">{`${labels.price}: ${(s.price / 100).toFixed(2)}${s.price === s.unitPrice ? '' : '(' + (s.unitPrice / 100).toFixed(2) + ')'}`}</div>
            <div className="list-subtext2">{`${labels.cost}: ${(s.cost / 100).toFixed(2)}${s.cost === s.unitCost ? '' : '(' + (s.unitCost / 100).toFixed(2) + ')'}`}</div>
            <div className="list-subtext3">{s.subQuantity ? `${labels.quantity}: ${s.subQuantity}` : ''}</div>
            {s.offerEnd ? <div className="list-subtext4">{labels.offerUpTo}: {moment(s.offerEnd.toDate()).format('Y/M/D')}</div> : ''}
            {s.isActive ? '' : <Badge slot="title" color='red'>{labels.inActive}</Badge>}
            {s.isActive ? <Button text={labels.purchase} slot="after" onClick={() => handlePurchase(s)} /> : ''}
          </ListItem>
        )}
      </List>
      <Toolbar bottom>
        <Footer/>
      </Toolbar>
    </Page>
  )
}

export default RequestedPackDetails
