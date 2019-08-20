import React, { useContext, useEffect, useState } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Badge} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';

const RequestedProducts = props => {
	const { state, products, orders } = useContext(StoreContext)
	const approvedOrders = orders.filter(rec => rec.status === 'a' || rec.status === 'e')
	approvedOrders.sort((order1, order2) => order1.time.seconds - order2.time.seconds)
	const [requiredProducts, setRequiredProducts] = useState([])
	let i = 0
	useEffect(() => {
		let productsArray = []
		approvedOrders.forEach(order => {
			order.basket.forEach(product => {
				if (product.quantity - product.purchasedQuantity > 0) {
					const found = productsArray.find(rec => rec.id === product.id && rec.price === product.price)
					const productInfo = products.find(rec => rec.id === product.id)
					if (found) {
						productsArray = productsArray.filter(rec => rec.id !== found.id)
						productsArray.push({
							...productInfo, 
							price: product.price, 
							quantity: product.quantity - product.purchasedQuantity + found.quantity
						})
					} else {
						productsArray.push({
							...productInfo, 
							price: product.price, 
							quantity: product.quantity - product.purchasedQuantity
						})
					}
				}
			})
		})
		productsArray = productsArray.map(product => {
			const inBasket = state.basket.products ? state.basket.products.find(rec => rec.id === product.id && rec.price === product.price) : false
			const inBasketQuantity = inBasket ? inBasket.quantity : 0
			return {
				...product,
				quantity: product.quantity - inBasketQuantity
			}
		})
		setRequiredProducts(productsArray.filter(rec => rec.quantity > 0))
	}, [state.basket])
  return(
    <Page>
      <Navbar title={state.labels.RequestedProducts} backLink="Back">
      </Navbar>
      <Block>
				<List mediaList>
					{requiredProducts && requiredProducts.map(product => 
						<ListItem
							link={`/requestedProduct/${product.id}/quantity/${product.quantity}/price/${product.price}`}
							title={product.name}
							after={(product.price / 1000).toFixed(3)}
							subtitle={product.description}
							text={`${state.labels.productOf} ${state.countries.find(rec => rec.id === product.country).name}`}
							key={i++}
							className={product.status === 'd' ? 'disable-product' : ''}
						>
							<img slot="media" src={product.imageUrl} width="80" className="lazy lazy-fadeIn demo-lazy" alt=""/>
							{product.quantity > 1 ? <Badge slot="title" color="red">{product.quantity}</Badge> : null}
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

export default RequestedProducts