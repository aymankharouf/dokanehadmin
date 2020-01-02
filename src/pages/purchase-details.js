import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import ReLogin from './relogin'
import { StoreContext } from '../data/store'
import { quantityText } from '../data/actions'
import labels from '../data/labels'


const PurchaseDetails = props => {
  const { state, user } = useContext(StoreContext)
  const purchaseBasket = useMemo(() => {
    const purchase = state.purchases.find(p => p.id === props.id)
    return purchase.basket.map(p => {
      const packInfo = state.packs.find(pa => pa.id === p.packId)
      const productInfo = state.products.find(pr => pr.id === packInfo.productId)
      const weightText = p.weight && p.weight !== p.quantity ? `(${quantityText(p.weight)})` : '' 
      return {
        ...p,
        packInfo,
        productInfo,
        weightText
      }
    })
  }, [state.purchases, state.packs, state.products, props.id])
  if (!user) return <ReLogin />
  return(
    <Page>
      <Navbar title={labels.purchaseDetails} backLink={labels.back} />
      <Block>
          <List mediaList>
            {purchaseBasket.map(p => 
              <ListItem 
                title={p.productInfo.name}
                subtitle={p.packInfo.name}
                text={`${labels.unitPrice}: ${(p.cost / 1000).toFixed(3)}`}
                footer={`${labels.quantity}: ${quantityText(p.quantity)} ${p.weightText}`}
                after={(parseInt(p.cost * (p.weight || p.quantity)) / 1000).toFixed(3)}
                key={p.packId} 
              />
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