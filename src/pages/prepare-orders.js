import React, { useContext, useState, useEffect } from 'react'
import { Block, Page, Navbar, Toolbar, List, ListItem } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import { quantityText } from '../data/actions'
import PackImage from './pack-image'
import labels from '../data/labels'

const PrepareOrders = props => {
  const { state } = useContext(StoreContext)
	const [packs, setPacks] = useState([])
	const [finishedOrders] = useState(() => state.orders.filter(o => o.status === 'd'))
	useEffect(() => {
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
		packsArray = packsArray.map(p => {
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
		setPacks(packsArray)
	}, [finishedOrders, state.packs, state.products])
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
								title={p.productInfo.name}
								subtitle={p.packInfo.name}
								text={`${labels.quantity}: ${quantityText(p.quantity)} ${p.weightText}`}
								key={i++}
							>
								<PackImage slot="media" pack={p.packInfo} type="list" />
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
