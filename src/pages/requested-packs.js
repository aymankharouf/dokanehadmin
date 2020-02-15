import React, { useContext, useEffect, useState } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import { quantityText, getRequestedPacks, getRequestedPackStores } from '../data/actions'
import PackImage from './pack-image'
import labels from '../data/labels'

const RequestedPacks = props => {
	const { state } = useContext(StoreContext)
	const [requestedPacks, setRequestedPacks] = useState([])
	useEffect(() => {
		setRequestedPacks(() => {
			let packs = getRequestedPacks(state.orders, state.basket, state.customers, state.packs)
			if (props.id){
				packs = packs.filter(p => {
					const basketStock = state.basket.storeId === 's' && state.basket.packs.find(bp => bp.packId === p.packId)
					const packStores = getRequestedPackStores(p.packInfo, (basketStock?.quantity || 0), state.storePacks, state.stores, state.packs, p.price)
					return packStores.find(ps => ps.storeId === props.id)
				})	
			}
			return packs
		})
	}, [props.id, state.basket, state.orders, state.packs, state.customers, state.stores, state.storePacks])
	let i = 0
	return(
    <Page>
      <Navbar title={`${labels.requestedPacks} ${props.id ? '-' + state.stores.find(s => s.id === props.id).name : ''}`} backLink={labels.back} />
      <Block>
				<List mediaList>
					{requestedPacks.length === 0 ? 
						<ListItem title={labels.noData} /> 
					: requestedPacks.map(p => 
							<ListItem
								link={`/requested-pack-details/${p.packId}/quantity/${p.quantity}/price/${p.price}/order/${p.orderId}/exceed/${p.exceedPriceQuantity}`}
								title={p.packInfo.productName}
								subtitle={p.packInfo.productAlias}
								text={p.packInfo.name}
								after={(p.price / 1000).toFixed(3)}
								key={i++}
							>
								<PackImage slot="media" pack={p.packInfo} type="list" />
								<div className="list-subtext1">{`${labels.quantity}: ${quantityText(p.quantity)}`}</div>
							</ListItem>
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

export default RequestedPacks