import { useContext, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { stockTransTypes } from '../data/config'
import BottomToolbar from './bottom-toolbar'

const StoreTrans = props => {
  const { state } = useContext(StoreContext)
  const [store] = useState(() => state.stores.find(s => s.id === props.id))
  const [trans, setTrans] = useState([])
  useEffect(() => {
    setTrans(() => {
      const stockTrans = state.stockTrans.filter(t => t.storeId === props.id && t.type !== 'p')
      let purchases = state.purchases.filter(p => p.storeId === props.id)
      purchases = purchases.map(p => {
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
          : trans.map(t => 
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
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default StoreTrans
