import React, { useContext, useEffect, useState } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import { getRequestedPacks, getRequestedPackStores } from '../data/actions'
import labels from '../data/labels'

const PurchasePlan = props => {
	const { state } = useContext(StoreContext)
	const [stores, setStores] = useState([])
	const [approvedOrders] = useState(() => state.orders.filter(o => ['a', 'e'].includes(o.status)))
	
	useEffect(() => {
		let storesArray = []
		const today = new Date()
    today.setDate(today.getDate() - 30)
		const packs = getRequestedPacks(approvedOrders, state.basket, state.customers, state.packs)
		packs.forEach(p => {
			const basketStock = state.basket.storeId === 's' && state.basket.packs.find(bp => bp.packId === p.packId)
			const packStores = getRequestedPackStores(p.packInfo, (basketStock?.quantity || 0), state.storePacks, state.stores, state.packs, p.price)
			packStores.forEach(ps => {
				const found = storesArray.findIndex(s => s.store.id === ps.storeId)
				if (found > -1) {
					if (storesArray[found].lastPack !== p.packId) {
						storesArray.splice(found, 1, {
							...storesArray[found],
							lastPack: p.packid,
							packsCount: storesArray[found].packsCount + 1
						})
					}
				} else {
					const storeInfo = state.stores.find(s => s.id === ps.storeId)
					const storePurchases = state.purchases.filter(pu => pu.storeId === ps.storeId && pu.time.toDate() >= today)
					storesArray.push({
						store: storeInfo,
						sales: storePurchases.reduce((sum, pu) => sum + pu.total, 0),
						lastPack: p.packId,
						packsCount: 1
					})
				}
			})
		})
		storesArray.sort((s1, s2) => {
			if (s1.store.type === s2.store.type){
				if (s1.store.discount === s2.store.discount) {
					return s1.sales - s2.sales
				} else {
					return s2.store.discount - s1.store.discount
				}
			} else {
				return Number(s1.store.type) - Number(s2.store.type)
			}
		})
		setStores(storesArray)
	}, [state.basket, approvedOrders, state.stores, state.packs, state.customers, state.storePacks, state.purchases])
	let i = 0
	return(
    <Page>
      <Navbar title={labels.purchasePlan} backLink={labels.back} />
      <Block>
				<List mediaList>
					{stores.length === 0 ? 
						<ListItem title={labels.noData} /> 
					: stores.map(s => 
							<ListItem
								link={`/purchase-plan-details/${s.store.id}`}
								title={s.store.name}
								subtitle={s.store.discount}
								text={`${labels.sales}: ${(s.sales / 1000).toFixed(3)}`}
								after={s.packsCount}
								key={i++}
							/>
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

export default PurchasePlan