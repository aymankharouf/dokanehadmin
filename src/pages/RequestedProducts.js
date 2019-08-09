import React, { useContext, useEffect, useState } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Searchbar, NavRight, Link} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';

const RequestedProducts = props => {
	const { state, products, orders } = useContext(StoreContext)
	const approvedOrders = orders.filter(rec => rec.status === 'a' || rec.status === 'e')
	const [requiredProducts, setRequiredProducts] = useState([])
	useEffect(() => {
		let productsArray = []
		approvedOrders.forEach(order => {
			order.basket.forEach(product => {
				const found = productsArray.find(rec => rec.id === product.id && rec.price === product.price)
				const inBasket = state.basket.products ? state.basket.products.find(rec => rec.id === product.id && rec.price === product.price) : false
				const inBasketQuantity = inBasket ? inBasket.quantity : 0
				if (product.quantity - product.purchasedQuantity - inBasketQuantity > 0) {
					const productInfo = products.find(rec => rec.id === product.id)
					if (found) {
						productsArray = productsArray.filter(rec => rec.id !== found.id)
						productsArray.push({
							...productInfo, 
							price: product.price, 
							purchasedPrice: product.purchasedPrice, 
							quantity: product.quantity - product.purchasedQuantity - inBasketQuantity + found.quantity
						})
					} else {
						productsArray.push({
							...productInfo, 
							price: product.price, 
							purchasedPrice: product.purchasedPrice, 
							quantity: product.quantity - product.purchasedQuantity - inBasketQuantity
						})
					}
				}
			})
		})
		setRequiredProducts(productsArray)
	}, [state.basket])
  return(
    <Page>
      <Navbar title='Requested Products' backLink="Back">
      </Navbar>
      <Block>
				<List mediaList>
					{requiredProducts && requiredProducts.map(product => 
						<ListItem
							link={`/requestedProduct/${product.id}/quantity/${product.quantity}/price/${product.price}`}
							title={product.name}
							after={product.quantity}
							subtitle={`${product.size} ${state.units.find(rec => rec.id === product.unit).name}`}
							text={product.price}
							key={product.id}
							className={product.status === 'd' ? 'disable-product' : ''}
						>
							<img slot="media" src={product.imageUrl} width="80" className="lazy lazy-fadeIn demo-lazy" alt=""/>
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