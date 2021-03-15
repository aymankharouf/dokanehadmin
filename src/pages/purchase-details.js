import { useContext, useState, useEffect } from 'react'
import { f7, Page, Block, Navbar, List, ListItem, Button, Badge } from 'framework7-react'
import Footer from './footer'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { showMessage, showError, getMessage, quantityText } from '../data/actions'


const PurchaseDetails = props => {
  const { state, dispatch } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [purchase, setPurchase] = useState('')
  const [purchaseBasket, setPurchaseBasket] = useState([])
  useEffect(() => {
    setPurchase(() => props.type === 'a' ? state.archivedPurchases.find(p => p.id === props.id) : state.purchases.find(p => p.id === props.id))
  }, [state.purchases, state.archivedPurchases, props.id, props.type])
  useEffect(() => {
    setPurchaseBasket(() => {
      const purchaseBasket =  purchase ? purchase.basket.filter(p => !(state.returnBasket?.purchaseId === purchase.id && state.returnBasket?.packs?.find(bp => bp.packId === p.packId && (!bp.weight || bp.weight === p.weight)))) : []
      return purchaseBasket.map(p => {
        const packInfo = state.packs.find(pa => pa.id === p.packId)
        return {
          ...p,
          packInfo,
        }
      })
    })
  }, [state.packs, state.returnBasket, purchase])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleReturn = pack => {
    try{
      const affectedOrders = state.orders.filter(o => o.basket.find(p => p.packId === pack.packId && p.lastPurchaseId === purchase.id) && ['p', 'd'].includes(o.status))
      if (affectedOrders.length > 0) {
        throw new Error('finishedOrdersAffected')
      }
      if (state.returnBasket && state.returnBasket.purchase !== purchase) {
        throw new Error('diffPurchaseInReturnBasket')
      }
      const params = {
        type: 'c',
        packId: pack.packId,
        cost: pack.cost,
        price: pack.price,
        quantity: pack.quantity,
        weight: pack.weight,
        storeId: purchase.storeId,
        purchaseId: purchase.id
      }
      dispatch({type: 'ADD_TO_RETURN_BASKET', params})
      showMessage(labels.addToBasketSuccess)
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  let i = 0
  return(
    <Page>
      <Navbar title={labels.purchaseDetails} backLink={labels.back} />
      <Block>
        <List mediaList>
          {purchaseBasket.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : purchaseBasket.map(p => 
            <ListItem 
              title={p.packInfo.productName}
              subtitle={p.packInfo.productAlias}
              text={p.packInfo.name}
              footer={`${labels.price}: ${(Math.round(p.cost * (p.weight || p.quantity)) / 100).toFixed(2)}`}
              key={i++} 
            >
              <img src={p.packInfo.imageUrl} slot="media" className="img-list" alt={labels.noImage} />
              <div className="list-subtext1">{`${labels.unitPrice}: ${(p.cost / 100).toFixed(2)}`}</div>
              <div className="list-subtext2">{`${labels.quantity}: ${quantityText(p.quantity, p.weight)}`}</div>
              {p.packInfo.closeExpired ? <Badge slot="text" color="red">{labels.closeExpired}</Badge> : ''}
              {props.type === 'n' ? <Button text={labels.return} slot="after" onClick={() => handleReturn(p)} /> : ''}
            </ListItem>
          )}
        </List>
      </Block>
      <Footer/>
    </Page>
  )
}
export default PurchaseDetails
