import React, { useContext, useEffect, useState, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Badge} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';

const RequestedPacks = props => {
	const { state } = useContext(StoreContext)
	const approvedOrders = useMemo(() => {
		const approvedOrders = state.orders.filter(rec => rec.status === 'a' || rec.status === 'e')
		return approvedOrders.sort((rec1, rec2) => rec1.time.seconds - rec2.time.seconds)
	}, [state.orders])
	
	const [requiredPacks, setRequiredPacks] = useState([])
	let i = 0
	useEffect(() => {
		let packsArray = []
		approvedOrders.forEach(order => {
			order.basket.forEach(pack => {
				if (pack.quantity - pack.purchasedQuantity > 0) {
					const found = packsArray.find(rec => rec.id === pack.id && rec.price === pack.price)
					const packInfo = state.packs.find(rec => rec.id === pack.id)
					if (found) {
						packsArray = packsArray.filter(rec => rec.id !== found.id)
						packsArray.push({
							...packInfo, 
							price: pack.price, 
							quantity: pack.quantity - pack.purchasedQuantity + found.quantity
						})
					} else {
						packsArray.push({
							...packInfo, 
							price: pack.price, 
							quantity: pack.quantity - pack.purchasedQuantity
						})
					}
				}
			})
		})
		packsArray = packsArray.map(pack => {
			const inBasket = state.basket.packs ? state.basket.packs.find(rec => rec.id === pack.id && rec.price === pack.price) : false
			const inBasketQuantity = inBasket ? inBasket.quantity : 0
			return {
				...pack,
				quantity: pack.quantity - inBasketQuantity
			}
		})
		setRequiredPacks(packsArray.filter(rec => rec.quantity > 0))
	}, [state.basket])
  return(
    <Page>
      <Navbar title={state.labels.RequestedProducts} backLink={state.labels.back}>
      </Navbar>
      <Block>
				<List mediaList>
					{requiredPacks && requiredPacks.map(pack => {
						const productInfo = state.products.find(rec => rec.id === pack.productId)
						return (
							<ListItem
								link={`/requestedPack/${pack.id}/quantity/${pack.quantity}/price/${pack.price}`}
								title={productInfo.name}
								after={(pack.price / 1000).toFixed(3)}
								subtitle={pack.name}
								text={`${state.labels.productOf} ${state.countries.find(rec => rec.id === productInfo.country).name}`}
								key={i++}
								className={productInfo.status === 'd' ? 'disable-product' : ''}
							>
								<img slot="media" src={productInfo.imageUrl} width="80" className="lazy lazy-fadeIn" alt=""/>
								{pack.quantity > 1 ? <Badge slot="title" color="red">{pack.quantity}</Badge> : null}
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