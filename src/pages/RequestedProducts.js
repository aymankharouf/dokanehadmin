import React, { useContext, useEffect, useState } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Searchbar, NavRight, Link} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';

const RequestedProducts = props => {
	const { state, orders } = useContext(StoreContext)
	const activeOrders = orders.filter(rec => rec.status === 'a')
	const [products, setProducts] = useState([])
	useEffect(() => {
		let productsArray = []
		activeOrders.forEach(order => {
			order.basket.forEach(product => {
				const found = productsArray.find(rec => rec.id === product.id)
				if (found) {
					productsArray = productsArray.filter(rec => rec.id !== found.id)
					productsArray.push({...product, quantity: product.quantity + found.quantity})
				} else {
					productsArray.push({...product, quantity: product.quantity})
				}
			})
		})
		setProducts(productsArray)
	}, [])
  return(
    <Page>
      <Navbar title='Requested Products' backLink="Back">
        <NavRight>
          <Link searchbarEnable=".searchbar-demo" iconIos="f7:search" iconAurora="f7:search" iconMd="material:search"></Link>
        </NavRight>
      </Navbar>
      <Block>
				<List>
					<Searchbar
						className="searchbar-demo"
						searchContainer=".search-list"
						searchIn=".item-title, .item-subtitle"
						clearButton
						expandable
						placeholder={state.labels.search}
					></Searchbar>
				</List>
				<List className="searchbar-not-found">
					<ListItem title={state.labels.not_found} />
				</List>
				<List mediaList className="search-list searchbar-found">
					{products && products.map(product => {
						return (
							<ListItem
								link={`/product/${product.id}`}
								title={product.name}
								after={product.quantity}
								subtitle={product.price}
								text="test"
								key={product.id}
								className={product.status === 'd' ? 'disable-product' : ''}
							>
								<img slot="media" src={product.imageUrl} width="80" className="lazy lazy-fadeIn demo-lazy" alt=""/>
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

export default RequestedProducts