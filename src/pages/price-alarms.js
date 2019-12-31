import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar} from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import PackImage from './pack-image'
import labels from '../data/labels'

const PriceAlarms = props => {
  const { state } = useContext(StoreContext)
  const priceAlarms = useMemo(() => {
    const priceAlarms = state.priceAlarms.filter(a => a.status === 'n')
    return priceAlarms.sort((a1, a2) => a1.time.seconds - a2.time.seconds)
  }, [state.priceAlarms])
  return(
    <Page>
      <Navbar title={labels.priceAlarms} backLink={labels.back} />
      <Block>
          <List mediaList>
            {priceAlarms.length === 0 ? 
              <ListItem title={labels.noData} /> 
            : priceAlarms.map(a => {
                const pack = state.packs.find(p => p.id === a.packId)
                return (
                  <ListItem
                    link={`/price-alarm-details/${a.id}`}
                    title={state.products.find(p => p.id === pack.productId).name}
                    subtitle={pack.name}
                    text={moment(a.time.toDate()).fromNow()}
                    after={(a.price / 1000).toFixed(3)}
                    key={a.id}
                  >
                    <PackImage slot="media" pack={pack} type="list" />
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
