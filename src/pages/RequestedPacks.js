import React, { useContext, useEffect, useState, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Badge} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';
import { quantityText } from '../data/Actions';

const RequestedPacks = props => {
	const { state } = useContext(StoreContext)
	const approvedOrders = useMemo(() => {
		const approvedOrders = state.orders.filter(o => o.status === 'a' || o.status === 'e')
		return approvedOrders.sort((o1, o2) => o1.time.seconds - o2.time.seconds)
	}, [state.orders])
	
	const [requiredPacks, setRequiredPacks] = useState([])
	let i = 0
	useEffect(() => {
		let packsArray = []
		approvedOrders.forEach(o => {
			o.basket.forEach(p => {
				if (!p.isFinished) {
					const packInfo = state.packs.find(pa => pa.id === p.packId)
					const found = packsArray.find(pa => pa.packId === p.packId && pa.price === p.price)
					if (!packInfo.byWeight && found) {
						packsArray = packsArray.filter(pa => pa.packId !== found.packId)
						packsArray.push({
							packId: p.packId,
							price: p.price, 
							quantity: p.quantity - p.purchasedQuantity + found.quantity
						})
					} else {
						packsArray.push({
							packId: p.packId,
							price: p.price, 
							quantity: p.quantity - p.purchasedQuantity,
							byWeight: packInfo.byWeight,
							orderId: o.id
						})
					}
				}
			})
		})
		packsArray = packsArray.map(p => {
			const inBasket = state.basket.packs ? (p.byWeight ? state.basket.packs.find(pa => pa.packId === p.packId && pa.orderId === p.orderId) : state.basket.packs.find(pa => pa.packId === p.packId && pa.price === p.price)) : false
			const inBasketQuantity = inBasket ? (p.byWeight ? inBasket.weight : inBasket.quantity) : 0
			return {
				...p,
				quantity: p.quantity - inBasketQuantity
			}
		})
		setRequiredPacks(packsArray.filter(p => p.quantity > 0))
	}, [state.basket, approvedOrders, state.packs])
  return(
    <Page>
      <Navbar title={state.labels.RequestedProducts} backLink={state.labels.back}>
      </Navbar>
      <Block>
				<List mediaList>
					{requiredPacks && requiredPacks.map(p => {
						const packInfo = state.packs.find(pa => pa.id === p.packId)
						const productInfo = state.products.find(pr => pr.id === packInfo.productId)
						return (
							<ListItem
								link={`/requestedPack/${p.packId}/quantity/${p.quantity}/price/${p.price}/order/${p.orderId}`}
								title={productInfo.name}
								after={(p.price / 1000).toFixed(3)}
								subtitle={packInfo.name}
								key={i++}
							>
								<img slot="media" src={productInfo.imageUrl} className="img-list" alt={productInfo.name} />
								<Badge slot="title" color="green">{quantityText(p.quantity, state.labels)}</Badge>
							</ListItem>
						)
					})}
				</List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default RequestedPacks