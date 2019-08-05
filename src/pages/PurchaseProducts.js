import React, { useContext } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Searchbar, NavRight, Link} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';

const PurchaseProducts = props => {
	const { state, products, orders } = useContext(StoreContext)
	const activeOrders = orders.filter(rec => rec.status === 'a')
  const wantedProducts = activeOrders.map(order => {
		order.basket.forEach(rec => {
			return {...rec, quantity: rec.basket.quantity}
		})
	})
	let uniqueProducts = []
	wantedProducts.forEach(product => {
		const found = uniqueProducts.find(rec => rec.id === product.id)
		if (found) {
			uniqueProducts = uniqueProducts.filter(rec => rec.id !== found.id)
			uniqueProducts.push({id: product.id, quantity: product.quantity + found.quantity})
		} else {
			uniqueProducts.push({id: product.id, quantity: product.quantity})
		}
	})
  return(
    <Page>
      <Navbar title='All Products' backLink="Back">
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
					{allProducts && allProducts.map(product => {
						return (
							<ListItem
								link={`/product/${product.id}`}
								title={product.name}
								after={product.price}
								subtitle={product.trademark ? state.trademarks.find(trademark => trademark.id === product.trademark).name : ''}
								text={product.name}
								key={product.id}
								className={product.status === '2' ? 'disable-product' : ''}
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

export default PurchaseProducts