import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Badge } from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';
import moment from 'moment'

const EndedOffers = props => {
  const { state } = useContext(StoreContext)
  const packs = useMemo(() => state.packs.filter(p => p.stores.find(s => s.offerEnd && new Date() > s.offerEnd.toDate()))
  , [state.packs])
  const packStores = useMemo(() => {
    let stores = []
    let i = 0
    packs.forEach(p => {
      p.stores.forEach(s => {
        if (s.offerEnd && new Date() > s.offerEnd.toDate()){
          stores.push({
            packId: p.id,
            productId: p.productId,
            name: p.name,
            storeId: s.id,
            price: s.price,
            offerEnd: s.offerEnd,
            id: i++
          })
        }
      })
    })
    stores.sort((s1, s2) => s1.offerEnd.seconds - s2.offerEnd.seconds)
    return stores
  }, [packs])
  return(
    <Page>
      <Navbar title={state.labels.EndedOffers} backLink={state.labels.back} />
        <Block>
          <List mediaList>
            {packStores && packStores.map(p => {
              const productInfo = state.products.find(pr => pr.id === p.productId)
              return (
                <ListItem
                  link={`/editPrice/${p.storeId}/pack/${p.packId}`}
                  title={productInfo.name}
                  after={(p.price / 1000).toFixed(3)}
                  subtitle={p.name}
                  text={`${state.labels.productOf} ${state.countries.find(c => c.id === productInfo.country).name}`}
                  footer={state.stores.find(s => s.id === p.storeId).name}
                  key={p.id}
                >
                  <img slot="media" src={productInfo.imageUrl} className="lazy lazy-fadeIn avatar" alt={productInfo.name} />
                  <Badge slot="footer" color="red">{moment(p.offerEnd.toDate()).format('DD/MM/YYYY')}</Badge>
                </ListItem>
              )
            })}
            {packStores.length === 0 ? <ListItem title={state.labels.noData} /> : null}
          </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default EndedOffers