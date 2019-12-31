import React, { useContext, useEffect, useState, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import { quantityText, addQuantity } from '../data/actions'
import PackImage from './pack-image'
import labels from '../data/labels'
import { setup } from '../data/config'

const RequestedPacks = props => {
	const { state } = useContext(StoreContext)
	const [requiredPacks, setRequiredPacks] = useState([])
	const approvedOrders = useMemo(() => state.orders.filter(o => o.status === 'a' || o.status === 'e')
	, [state.orders])
	
	let i = 0
	useEffect(() => {
		let packsArray = []
		approvedOrders.forEach(o => {
			const customerInfo = state.customers.find(c => c.id === o.userId)
			o.basket.forEach(p => {
				let exceedPriceQuantity = 0
				if (p.status === 'n' || p.status === 'p') {
					const packInfo = state.packs.find(pa => pa.id === p.packId)
					const found = packsArray.find(pa => pa.packId === p.packId && pa.price === p.price)
					if (p.price < packInfo.price && parseInt(p.price * (100 + setup.exceedPricePercent) / 100) >= packInfo.price && customerInfo.exceedPrice) {
						exceedPriceQuantity = p.quantity - p.purchased
					}
					if (!packInfo.byWeight && found) {
						packsArray = packsArray.filter(pa => pa.packId !== found.packId)
						packsArray.push({
							...found, 
							quantity: found.quantity + p.quantity - p.purchased,
							exceedPriceQuantity: found.exceedPriceQuantity + exceedPriceQuantity
						})
					} else {
						packsArray.push({
							packId: p.packId,
							price: p.price, 
							quantity: p.quantity - p.purchased,
							exceedPriceQuantity,
							byWeight: packInfo.byWeight,
							orderId: o.id
						})
					}
				}
			})
		})
		packsArray = packsArray.map(p => {
			let inBasket, offerInfo
			let inBasketQuantity = 0
			if (state.basket.packs) {
				if (p.byWeight) {
					inBasket = state.basket.packs.find(pa => pa.packId === p.packId && pa.orderId === p.orderId)
					inBasketQuantity = inBasket?.quantity || 0
				} else {
					inBasket = state.basket.packs.find(pa => pa.packId === p.packId && pa.price === p.price)
					if (inBasket) {
						inBasketQuantity = inBasket.quantity
					} else {
						inBasket = state.basket.packs.find(bp => state.packs.find(pa => pa.id === bp.packId && (pa.subPackId === p.packId || pa.bonusPackId === p.packId)) && bp.price === p.price)
						if (inBasket) {
							offerInfo = state.packs.find(pa => pa.id === inBasket.packId && pa.subPackId === p.packId)
							if (offerInfo) {
								inBasketQuantity = inBasket.quantity * offerInfo.subQuantity
							} else {
								offerInfo = state.packs.find(pa => p.aid === inBasket.packId && pa.bonusPackId === p.packId)
								if (offerInfo) {
									inBasketQuantity = inBasket.quantity * offerInfo.bonusQuantity
								}
							}
						}
					}
				}	
			}
			if (inBasketQuantity > 0) {
				if (parseInt(Math.abs(addQuantity(p.quantity, -1 * inBasketQuantity)) / p.quantity * 100) > setup.weightErrorMargin) {
					return {
						...p,
						quantity: addQuantity(p.quantity, -1 * inBasketQuantity),
						exceedPriceQuantity: addQuantity(p.exceedPriceQuantity, -1 * inBasketQuantity)
					}
				} else {
					return {
						...p,
						quantity: 0
					}
				}
			} else {
				return p
			}
		})
		setRequiredPacks(packsArray.filter(p => p.quantity > 0))
	}, [state.basket, approvedOrders, state.packs, state.customers])
  return(
    <Page>
      <Navbar title={labels.requestedPacks} backLink={labels.back} />
      <Block>
				<List mediaList>
					{requiredPacks.length === 0 ? 
						<ListItem title={labels.noData} /> 
					: requiredPacks.map(p => {
							const packInfo = state.packs.find(pa => pa.id === p.packId)
							return (
								<ListItem
									link={`/requested-pack-details/${p.packId}/quantity/${p.quantity}/price/${p.price}/order/${p.orderId}/exceed-price-quantity/${p.exceedPriceQuantity}`}
									title={state.products.find(pr => pr.id === packInfo.productId).name}
									subtitle={packInfo.name}
									text={`${labels.requested}: ${quantityText(p.quantity)}`}
									after={(p.price / 1000).toFixed(3)}
									key={i++}
								>
									<PackImage slot="media" pack={packInfo} type="list" />
								</ListItem>
							)
						})
					}
				</List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default RequestedPacks