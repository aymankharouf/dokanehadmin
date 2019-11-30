import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Badge } from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';
import moment from 'moment'

const Offers = props => {
  const { state } = useContext(StoreContext)
  const storePacks = useMemo(() => {
    const storePacks = state.storePacks.filter(p => p.offerEnd)
    return storePacks.sort((p1, p2) => p1.offerEnd.seconds - p2.offerEnd.seconds)
  }, [state.storePacks])
  return(
    <Page>
      <Navbar title={state.labels.EndedOffers} backLink={state.labels.back} />
        <Block>
          <List mediaList>
            {storePacks && storePacks.map(p => {
              const packInfo = state.packs.find(pa => pa.id === p.packId)
              const productInfo = state.products.find(pr => pr.id === packInfo.productId)
              return (
                <ListItem
                  link={`/storePack/${p.id}`}
                  title={productInfo.name}
                  after={(p.price / 1000).toFixed(3)}
                  subtitle={packInfo.name}
                  text={`${state.labels.productOf} ${state.countries.find(c => c.id === productInfo.country).name}`}
                  footer={state.stores.find(s => s.id === p.storeId).name}
                  key={p.id}
                >
                  <img slot="media" src={productInfo.imageUrl} className="img-list" alt={productInfo.name} />
                  <Badge slot="footer" color="red">{moment(p.offerEnd.toDate()).format('DD/MM/YYYY')}</Badge>
                </ListItem>
              )
            })}
            {storePacks.length === 0 ? <ListItem title={state.labels.noData} /> : ''}
          </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Offers