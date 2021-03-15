import { useContext, useState, useEffect } from 'react'
import { Page, Block, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import Footer from './footer'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { quantityText } from '../data/actions'


const PackTrans = props => {
  const { state } = useContext(StoreContext)
  const [pack] = useState(() => state.packs.find(p => p.id === props.id))
  const [packTrans, setPackTrans] = useState([])
  useEffect(() => {
    setPackTrans(() => {
      const purchases = state.purchases.filter(p => p.basket.find(p => p.packId === pack.id))
      const packTrans = purchases.map(p => {
        const transPack = p.basket.find(pa => pa.packId === pack.id)
        const storeInfo = state.stores.find(s => s.id === p.storeId)
        return {
          ...transPack,
          id: p.id,
          time: p.time,
          storeInfo
        }
      })
      return packTrans.sort((t1, t2) => t2.time.seconds - t1.time.seconds)
    })
  }, [state.purchases, state.stores, pack])
  return(
    <Page>
      <Navbar title={`${pack.productName} ${pack.name}`} backLink={labels.back} />
      <Block>
        <List mediaList>
          {packTrans.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : packTrans.map(t => 
              <ListItem
                title={t.storeInfo.name}
                subtitle={`${labels.quantity}: ${quantityText(t.quantity, t.weight)}`}
                footer={moment(t.time.toDate()).fromNow()}
                after={(t.cost / 100).toFixed(2)}
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

export default PackTrans
