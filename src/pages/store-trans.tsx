import { useContext, useState, useEffect } from 'react'
import { Page, Block, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import Footer from './footer'

const StoreTrans = (props: any) => {
  const { state } = useContext(StoreContext)
  const [store] = useState(() => state.stores.find((s: any) => s.id === props.id))
  const [trans, setTrans] = useState<any>([])
  useEffect(() => {
    setTrans(() => {
      let purchases = state.purchases.filter((p: any) => p.storeId === props.id)
      return purchases.sort((t1: any, t2: any) => t2.time.seconds - t1.time.seconds)
    })
  }, [state.purchases, props.id])

  return(
    <Page>
      <Navbar title={`${labels.trans} ${store.name}`} backLink={labels.back} />
      <Block>
        <List mediaList>
          {trans.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : trans.map((t: any) => 
              <ListItem
                link={t.type === 'p' ? `/purchase-details/${t.id}/type/n` : `/stock-trans-details/${t.id}/type/n`}
                title={t.stockTransTypeInfo.name}
                subtitle={`${labels.total}: ${(t.total / 100).toFixed(2)}`}
                text={moment(t.time.toDate()).fromNow()}
                key={t.id}
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

export default StoreTrans
