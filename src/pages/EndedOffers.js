import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Badge } from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';
import moment from 'moment'

const EndedOffers = props => {
  const { state } = useContext(StoreContext)
  const packs = useMemo(() => state.packs.filter(rec => rec.stores.find(store => store.offerEnd && new Date() > store.offerEnd.toDate()))
  , [state.packs])
  const packStores = useMemo(() => {
    let stores = []
    let i = 0
    packs.forEach(pack => {
      pack.stores.forEach(store => {
        if (store.offerEnd && new Date() > store.offerEnd.toDate()){
          stores.push({
            packId: pack.id,
            productId: pack.productId,
            name: pack.name,
            storeId: store.id,
            price: store.price,
            offerEnd: store.offerEnd,
            id: i++
          })
        }
      })
    })
    stores.sort((rec1, rec2) => rec1.offerEnd.seconds - rec2.offerEnd.seconds)
    return stores
  }, [packs])
  return(
    <Page>
      <Navbar title={state.labels.EndedOffers} backLink={state.labels.back} />
        <Block>
          <List mediaList>
            {packStores && packStores.map(packStore => {
              const productInfo = state.products.find(rec => rec.id === packStore.productId)
              return (
                <ListItem
                  link={`/editPrice/${packStore.storeId}/pack/${packStore.packId}`}
                  title={productInfo.name}
                  after={(packStore.price / 1000).toFixed(3)}
                  subtitle={packStore.name}
                  text={`${state.labels.productOf} ${state.countries.find(rec => rec.id === productInfo.country).name}`}
                  footer={state.stores.find(rec => rec.id === packStore.storeId).name}
                  key={packStore.id}
                >
                  <img slot="media" src={productInfo.imageUrl} className="lazy lazy-fadeIn avatar" alt=""/>
                  <Badge slot="footer" color="red">{moment(packStore.offerEnd.toDate()).format('DD/MM/YYYY')}</Badge>
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