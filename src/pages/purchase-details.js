import React, { useContext, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Button } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import PackImage from './pack-image'
import { showMessage, showError, getMessage, quantityText } from '../data/actions'


const PurchaseDetails = props => {
  const { state, dispatch } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [purchase] = useState(() => props.type === 'a' ? state.archivedPurchases.find(p => p.id === props.id) : state.purchases.find(p => p.id === props.id))
  const [purchaseBasket, setPurchaseBasket] = useState([])
  useEffect(() => {
    setPurchaseBasket(() => {
      return purchase ? purchase.basket.map(p => {
        const packInfo = state.packs.find(pa => pa.id === p.packId)
        const weightText = p.weight && p.weight !== p.quantity ? `(${quantityText(p.weight)})` : '' 
        return {
          ...p,
          packInfo,
          weightText
        }
      }) : []
    })
  }, [state.packs, purchase])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleReturn = async pack => {
    try{
      const affectedOrders = state.orders.filter(o => o.basket.find(p => p.lastPurchaseId === purchase.id) && ['d', 'p', 't', 'f'].includes(o.status))
      if (affectedOrders.length > 0) {
        throw new Error('finishedOrdersAffected')
      }
      const params = {
        pack,
        purchase
      }
      dispatch({type: 'ADD_TO_RETURN_BASKET', params})
      showMessage(labels.addToBasketSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  return(
    <Page>
      <Navbar title={labels.purchaseDetails} backLink={labels.back} />
      <Block>
        <List mediaList>
          {purchaseBasket.map(p => 
            <ListItem 
              title={p.packInfo.productName}
              subtitle={p.packInfo.name}
              text={`${labels.unitPrice}: ${(p.cost / 1000).toFixed(3)}`}
              footer={`${labels.price}: ${(parseInt(p.cost * (p.weight || p.quantity)) / 1000).toFixed(3)}`}
              key={p.packId} 
            >
              <PackImage slot="media" pack={p.packInfo} type="list" />
              <div className="list-subtext1">{`${labels.quantity}: ${quantityText(p.quantity)} ${p.weightText}`}</div>
              {p.returnedQuantity ? <div className="list-subtext2">{`${labels.returned}: ${quantityText(p.returnedQuantity)}`}</div> : ''}
              {p.returnedQuantity === p.quantity ? '' : <Button text={labels.return} slot="after" onClick={() => handleReturn(p)} />}
            </ListItem>
          )}
        </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}
export default PurchaseDetails
