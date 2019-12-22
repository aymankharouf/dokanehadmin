import React, { useContext, useEffect, useState, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';
import { quantityText, addQuantity } from '../data/Actions';

const RequestedPacks = props => {
	const { state } = useContext(StoreContext)
	const [requiredPacks, setRequiredPacks] = useState([])
	const approvedOrders = useMemo(() => state.orders.filter(o => o.status === 'a' || o.status === 'e')
	, [state.orders])
	
	let i = 0
	useEffect(() => {
		let packsArray = []
		approvedOrders.forEach(o => {
			o.basket.forEach(p => {
				if (p.status === 'n' || p.status === 'p') {
					const packInfo = state.packs.find(pa => pa.id === p.packId)
					const found = packsArray.find(pa => pa.packId === p.packId && pa.price === p.price)
					if (!packInfo.byWeight && found) {
						packsArray = packsArray.filter(pa => pa.packId !== found.packId)
						packsArray.push({
							packId: p.packId,
							price: p.price, 
							quantity: p.quantity - p.purchased + found.quantity
						})
					} else {
						packsArray.push({
							packId: p.packId,
							price: p.price, 
							quantity: p.quantity - p.purchased,
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
					inBasketQuantity = inBasket?.quantity ?? 0
				} else {
					inBasket = state.basket.packs.find(pa => pa.packId === p.packId && pa.price === p.price)
					if (inBasket) {
						inBasketQuantity = inBasket.quantity
					} else {
						inBasket = state.basket.packs.find(bp => state.packs.find(pa => pa.id === bp.packId && (pa.offerPackId === p.packId || pa.bonusPackId === p.packId)) && bp.price === p.price)
						if (inBasket) {
							offerInfo = state.packs.find(pa => pa.id === inBasket.packId && pa.offerPackId === p.packId)
							if (offerInfo) {
								inBasketQuantity = inBasket.quantity * offerInfo.offerQuantity
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
				if (parseInt(Math.abs(addQuantity(p.quantity, -1 * inBasketQuantity)) / p.quantity * 100) > state.labels.margin) {
					return {
						...p,
						quantity: addQuantity(p.quantity, -1 * inBasketQuantity)
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
	}, [state.basket, approvedOrders, state.packs, state.labels])
  return(
    <Page>
      <Navbar title={state.labels.requestedPacks} backLink={state.labels.back} className="page-title" />
      <Block>
				<List mediaList>
					{requiredPacks.length === 0 ? 
						<ListItem title={state.labels.noData} /> 
					: requiredPacks.map(p => {
							const packInfo = state.packs.find(pa => pa.id === p.packId)
							const productInfo = state.products.find(pr => pr.id === packInfo.productId)
							const bonusProduct = p.bonusPackId ? state.products.find(pr => pr.id === state.packs.find(pa => pa.id === p.bonusPackId).productId) : ''
							return (
								<ListItem
									link={`/requestedPack/${p.packId}/quantity/${p.quantity}/price/${p.price}/order/${p.orderId}`}
									title={productInfo.name}
									after={(p.price / 1000).toFixed(3)}
									key={i++}
								>
									<div slot="media" className="relative">
										<img slot="media" src={productInfo.imageUrl} className="img-list" alt={productInfo.name} />
										{p.offerQuantity > 1 ? <span slot="media" className="offer-quantity-list">{`× ${p.offerQuantity}`}</span> : ''}
										{p.bonusPackId ? 
											<div>
												<img slot="media" src={bonusProduct.imageUrl} className="bonus-img-list" alt={bonusProduct.name} />
												{p.bonusQuantity > 1 ? <span slot="media" className="bonus-quantity-list">{`× ${p.bonusQuantity}`}</span> : ''}
											</div>
										: ''}
									</div>
									<div className="list-line1">{packInfo.name}</div>
									<div className="list-line2">{`${state.labels.requested}: ${quantityText(p.quantity)}`}</div>
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