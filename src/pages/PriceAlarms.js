import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/Store';

const PriceAlarms = props => {
  const { state } = useContext(StoreContext)
  const priceAlarms = useMemo(() => {
    const priceAlarms = state.priceAlarms.filter(rec => rec.status === 'n')
    return priceAlarms.sort((rec1, rec2) => rec1.time.seconds - rec2.time.seconds)
  }, [state.priceAlarms])
  return(
    <Page>
      <Navbar title={state.labels.priceAlarms} backLink={state.labels.back} />
      <Block>
          <List mediaList>
            {priceAlarms && priceAlarms.map(alarm => {
              const pack = state.packs.find(rec => rec.id === alarm.packId)
              const product = state.products.find(rec => rec.id === pack.productId)
              return (
                <ListItem
                  link={`/priceAlarmDetails/${alarm.id}`}
                  title={product.name}
                  after={(alarm.price / 1000).toFixed(3)}
                  subtitle={pack.name}
                  text={moment(alarm.time.toDate()).fromNow()}
                  key={alarm.id}
                >
                  <img slot="media" src={product.imageUrl} width="80" className="lazy lazy-fadeIn demo-lazy" alt=""/>
                </ListItem>
              )
            })}
            {priceAlarms.length === 0 ? <ListItem title={state.labels.noData} /> : ''}
          </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default PriceAlarms
