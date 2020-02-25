import React, { useContext, useState, useEffect } from 'react'
import { Block, Page, Navbar, Toolbar, List, ListItem } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import { quantityText } from '../data/actions'
import labels from '../data/labels'

const PrepareOrders = props => {
  const { state } = useContext(StoreContext)
	const [packs, setPacks] = useState([])
	useEffect(() => {
		setPacks(() => {
			const finishedOrders = state.orders.filter(o => o.status === 'f')
			let packsArray = []
			finishedOrders.forEach(o => {
				o.basket.forEach(p => {
					if (p.purchased > 0 && !p.isAllocated) {
						const found = packsArray.findIndex(pa => pa.packId === p.packId)
						if (!p.weight && found > -1) {
							packsArray.splice(found, 1, {
								packId: p.packId,
								quantity: p.purchased + packsArray[found].quantity
							})
						} else {
							packsArray.push({
								packId: p.packId,
								quantity: p.purchased,
								weight: p.weight,
								orderId: o.id
							})
						}
					}
				})
			})
			return packsArray.map(p => {
				const packInfo = state.packs.find(pa => pa.id === p.packId)
				return {
					...p,
					packInfo,
				}
			})
		})
	}, [state.orders, state.packs, state.products])
	let i = 0
  return(
    <Page>
      <Navbar title={labels.PurchasedProducts} backLink={labels.back} />
      <Block>
				<List mediaList>
					{packs.length === 0 ? 
						<ListItem title={labels.noData} /> 
					: packs.map(p => 
							<ListItem
								link={`/prepare-orders-list/${p.packId}/order/${p.orderId || 0}`}
								title={p.packInfo.productName}
								subtitle={p.packInfo.productAlias}
								text={p.packInfo.name}
								key={i++}
							>
								<img src={p.imageUrl} slot="media" className="img-list" alt={labels.noImage} />
								<div className="list-subtext1">{`${labels.quantity}: ${quantityText(p.quantity, p.weight)}`}</div>
							</ListItem>
						)
					}
				</List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}
export default PrepareOrders
