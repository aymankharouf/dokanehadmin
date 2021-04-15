import { useContext, useEffect, useState } from 'react'
import { Page, Block, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import Footer from './footer'
import { StoreContext } from '../data/store'
import { getRequestedPacks, getPackStores } from '../data/actions'
import labels from '../data/labels'

const PurchasePlan = () => {
	const { state } = useContext(StoreContext)
	const [stores, setStores] = useState([])
	const [approvedOrders] = useState(() => state.orders.filter((o: any) => ['a', 'e'].includes(o.status)))
	
	useEffect(() => {
		let storesArray: any = []
		const today = new Date()
    today.setDate(today.getDate() - 30)
		const packs = getRequestedPacks(approvedOrders, state.basket, state.packs)
		packs.forEach((p: any) => {
			const basketStock = state.basket.storeId === 's' && state.basket.packs.find((bp: any) => bp.packId === p.packId)
			const packStores = getPackStores(p.packInfo, state.packPrices, state.stores, state.packs, (basketStock?.quantity || 0))
			packStores.forEach((ps: any) => {
				const found = storesArray.findIndex((s: any) => s.store.id === ps.storeId)
				if (found > -1) {
					if (storesArray[found].lastPack !== p.packId) {
						storesArray.splice(found, 1, {
							...storesArray[found],
							lastPack: p.packid,
							packsCount: storesArray[found].packsCount + 1
						})
					}
				} else {
					const storeInfo = state.stores.find((s: any) => s.id === ps.storeId)
					const storePurchases = state.purchases.filter((pu: any) => pu.storeId === ps.storeId && pu.time.toDate() >= today)
					storesArray.push({
						store: storeInfo,
						sales: storePurchases.reduce((sum: any, pu: any) => sum + pu.total, 0),
						lastPack: p.packId,
						packsCount: 1
					})
				}
			})
		})
		storesArray.sort((s1: any, s2: any) => {
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
	}, [state.basket, approvedOrders, state.stores, state.packs, state.customers, state.packPrices, state.purchases])
	let i = 0
	return(
    <Page>
      <Navbar title={labels.purchasePlan} backLink={labels.back} />
      <Block>
				<List mediaList>
					{stores.length === 0 ? 
						<ListItem title={labels.noData} /> 
					: stores.map((s: any) => 
							<ListItem
								link={`/purchase-plan-details/${s.store.id}`}
								title={s.store.name}
								subtitle={s.store.id === 's' ? '' : `${labels.discount}: ${s.store.discount}`}
								text={s.store.id === 's' ? '' : `${labels.sales}: ${(s.sales / 100).toFixed(2)}`}
								after={s.packsCount}
								key={i++}
							/>
						)
					}
				</List>
      </Block>
      <Toolbar bottom>
        <Footer/>
      </Toolbar>
    </Page>
  )
}

export default PurchasePlan