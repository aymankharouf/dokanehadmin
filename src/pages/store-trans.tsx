import { useContext, useState, useEffect } from 'react'
import { Page, Block, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { stockTransTypes } from '../data/config'
import Footer from './footer'

const StoreTrans = (props: any) => {
  const { state } = useContext(StoreContext)
  const [store] = useState(() => state.stores.find((s: any) => s.id === props.id))
  const [trans, setTrans] = useState<any>([])
  useEffect(() => {
    setTrans(() => {
      const stockTrans = state.stockTrans.filter((t: any) => t.storeId === props.id && t.type !== 'p')
      let purchases = state.purchases.filter((p: any) => p.storeId === props.id)
      purchases = purchases.map((p: any) => {
        return {
          ...p,
          type: 'p'
        }
      })
      let trans = [...purchases, ...stockTrans]
      trans = trans.map(t => {
        const stockTransTypeInfo = stockTransTypes.find(ty => ty.id === t.type)
        return {
          ...t,
          stockTransTypeInfo
        }
      })
      return trans.sort((t1, t2) => t2.time.seconds - t1.time.seconds)
    })
  }, [state.stockTrans, state.purchases, props.id])

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
