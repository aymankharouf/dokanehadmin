import React, { useContext, useEffect, useState, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Badge} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';

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
				if (p.quantity - p.purchasedQuantity - (p.unavailableQuantity ? p.unavailableQuantity : 0)> 0) {
					const found = packsArray.find(pa => pa.packId === p.packId && pa.price === p.price)
					if (found) {
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
							quantity: p.quantity - p.purchasedQuantity
						})
					}
				}
			})
		})
		packsArray = packsArray.map(p => {
			const inBasket = state.basket.packs ? state.basket.packs.find(pa => pa.packId === p.packId && pa.price === p.price) : false
			const inBasketQuantity = inBasket ? inBasket.quantity : 0
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
								link={`/requestedPack/${p.packId}/quantity/${p.quantity}/price/${p.price}`}
								title={productInfo.name}
								after={(p.price / 1000).toFixed(3)}
								subtitle={packInfo.name}
								text={`${state.labels.productOf} ${state.countries.find(c => c.id === productInfo.country).name}`}
								key={i++}
							>
								<img slot="media" src={productInfo.imageUrl} width="80" className="lazy lazy-fadeIn" alt={productInfo.name} />
								{p.quantity > 1 ? <Badge slot="title" color="red">{p.quantity}</Badge> : ''}
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