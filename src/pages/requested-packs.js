import React, { useContext, useEffect, useState, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import { quantityText, requestedPacks } from '../data/actions'
import PackImage from './pack-image'
import labels from '../data/labels'

const RequestedPacks = props => {
	const { state } = useContext(StoreContext)
	const [requiredPacks, setRequiredPacks] = useState([])
	const approvedOrders = useMemo(() => state.orders.filter(o => o.status === 'a' || o.status === 'e')
	, [state.orders])
	
	let i = 0
	useEffect(() => {
		setRequiredPacks(requestedPacks(approvedOrders, state.basket, state.customers, state.packs, state.products))
	}, [state.basket, approvedOrders, state.packs, state.products, state.customers])
  return(
    <Page>
      <Navbar title={labels.requestedPacks} backLink={labels.back} />
      <Block>
				<List mediaList>
					{requiredPacks.length === 0 ? 
						<ListItem title={labels.noData} /> 
					: requiredPacks.map(p => 
							<ListItem
								link={`/requested-pack-details/${p.packId}/quantity/${p.quantity}/price/${p.price}/order/${p.orderId}/exceed-price-quantity/${p.exceedPriceQuantity}`}
								title={p.productInfo.name}
								subtitle={p.packInfo.name}
								text={`${labels.requested}: ${quantityText(p.quantity)}`}
								after={(p.price / 1000).toFixed(3)}
								key={i++}
							>
								<PackImage slot="media" pack={p.packInfo} type="list" />
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