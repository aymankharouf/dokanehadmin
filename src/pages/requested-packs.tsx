import { useContext, useEffect, useState } from 'react'
import { Page, Block, Navbar, List, ListItem, Badge, Toolbar } from 'framework7-react'
import Footer from './footer'
import { StoreContext } from '../data/store'
import { quantityText, getRequestedPacks, getPackStores } from '../data/actions'
import labels from '../data/labels'

const RequestedPacks = (props: any) => {
	const { state } = useContext(StoreContext)
	const [requestedPacks, setRequestedPacks] = useState([])
	useEffect(() => {
		setRequestedPacks(() => {
			let packs = getRequestedPacks(state.orders, state.basket, state.packs)
			if (props.id){
				packs = packs.filter((p: any) => {
					const basketStock = state.basket.storeId === 's' && state.basket.packs.find((bp: any) => bp.packId === p.packId || state.packs.find((pa: any) => pa.id === bp.packId && (pa.subPackId === p.packId || pa.bonusPackId === p.packId)))
					const basketStockQuantity = (basketStock?.quantity * basketStock?.refQuantity) || 0
					const packStores = getPackStores(p.packInfo, state.packPrices, state.stores, state.packs, basketStockQuantity)
					return packStores.find((ps: any) => ps.storeId === props.id)
				})	
			}
			return packs
		})
	}, [props.id, state.basket, state.orders, state.packs, state.customers, state.stores, state.packPrices])
	let i = 0
	return(
    <Page>
      <Navbar title={`${labels.requestedPacks} ${props.id ? '-' + state.stores.find((s: any) => s.id === props.id).name : ''}`} backLink={labels.back} />
      <Block>
				<List mediaList>
					{requestedPacks.length === 0 ? 
						<ListItem title={labels.noData} /> 
					: requestedPacks.map((p: any) => 
							<ListItem
								link={`/requested-pack-details/${p.packId}/quantity/${p.quantity}/price/${p.price}/order/${p.orderId}`}
								title={p.packInfo.productName}
								subtitle={p.packInfo.productAlias}
								text={p.packInfo.name}
								after={p.offerId ? '' : (p.price / 100).toFixed(2)}
								key={i++}
							>
								<img src={p.packInfo.imageUrl} slot="media" className="img-list" alt={labels.noImage} />
								<div className="list-subtext1">{`${labels.quantity}: ${quantityText(p.quantity)}`}</div>
								{p.packInfo.closeExpired ? <Badge slot="text" color="red">{labels.closeExpired}</Badge> : ''}
								{p.offerId ? <Badge slot="after" color="green">{(p.price / 100).toFixed(2)}</Badge> : ''}
							</ListItem>
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

export default RequestedPacks