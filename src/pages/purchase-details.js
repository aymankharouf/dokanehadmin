import React, { useContext, useState, useEffect } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, Button } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import PackImage from './pack-image'
import { returnPurchasePack, showMessage, showError, getMessage, quantityText } from '../data/actions'


const PurchaseDetails = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
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
  useEffect(() => {
    if (inprocess) {
      f7.dialog.preloader(labels.inprocess)
    } else {
      f7.dialog.close()
    }
  }, [inprocess])

  const handleReturn = async pack => {
    try{
      const affectedOrders = state.orders.filter(o => o.basket.find(p => p.lastPurchaseId === purchase.id) && ['d', 'p', 't', 'f'].includes(o.status))
      if (affectedOrders.length > 0) {
        throw new Error('finishedOrdersAffected')
      }
      setInprocess(true)
      await returnPurchasePack(purchase, pack, state.orders, state.stockTrans, state.storePacks, state.packs, state.stores)
      setInprocess(false)
      showMessage(labels.executeSuccess)
      props.f7router.back()
    } catch(err) {
      setInprocess(false)
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
              footer={`${labels.quantity}: ${quantityText(p.quantity)} ${p.weightText}`}
              key={p.packId} 
            >
              <PackImage slot="media" pack={p.packInfo} type="list" />
              <div className="list-subtext1">{`${labels.price}: ${(parseInt(p.cost * (p.weight || p.quantity)) / 1000).toFixed(3)}`}</div>
              <Button text={labels.return} slot="after" onClick={() => handleReturn(p)} />
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
