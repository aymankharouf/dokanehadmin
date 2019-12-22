import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/Store';

const PriceAlarms = props => {
  const { state } = useContext(StoreContext)
  const priceAlarms = useMemo(() => {
    const priceAlarms = state.priceAlarms.filter(a => a.status === 'n')
    return priceAlarms.sort((a1, a2) => a1.time.seconds - a2.time.seconds)
  }, [state.priceAlarms])
  return(
    <Page>
      <Navbar title={state.labels.priceAlarms} backLink={state.labels.back} />
      <Block>
          <List mediaList>
            {priceAlarms.length === 0 ? 
              <ListItem title={state.labels.noData} /> 
            : priceAlarms && priceAlarms.map(a => {
                const pack = state.packs.find(p => p.id === a.packId)
                const product = state.products.find(p => p.id === pack.productId)
                return (
                  <ListItem
                    link={`/priceAlarmDetails/${a.id}`}
                    title={product.name}
                    after={(a.price / 1000).toFixed(3)}
                    key={a.id}
                  >
                    <img slot="media" src={product.imageUrl} className="img-list" alt={product.name} />
                    <div className="list-line1">{pack.name}</div>
                    <div className="list-line2">{moment(a.time.toDate()).fromNow()}</div>
                  </ListItem>
                )
              })
            }
          </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default PriceAlarms
