import { useContext, useState, useEffect, useRef } from 'react'
import { f7, Page, Block, Navbar, List, ListItem, Fab, Icon, Toolbar } from 'framework7-react'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import Footer from './footer'
import labels from '../data/labels'
import { stockTransTypes } from '../data/config'
import { getArchivedStockTrans, getMessage, showError } from '../data/actions'

const ArchivedStockTrans = () => {
  const { state, dispatch } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [stockTrans, setStockTrans] = useState<any>([])
  const [monthlyTrans] = useState(() => [...state.monthlyTrans.sort((t1: any, t2: any) => t2.id - t1.id)])
  const lastMonth = useRef(0)
  useEffect(() => {
    setStockTrans(() => {
      const stockTrans = state.stockTrans.map((t: any) => {
        const stockTransTypeInfo = stockTransTypes.find(ty => ty.id === t.type)
        const storeInfo = state.stores.find((s: any) => s.id === t.storeId)
        return {
          ...t,
          stockTransTypeInfo,
          storeInfo
        }
      })
      return stockTrans.sort((t1: any, t2: any) => t2.time.seconds - t1.time.seconds)
    })
  }, [state.stockTrans, state.stores])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleRetreive = () => {
    try{
      const id = monthlyTrans[lastMonth.current]?.id
      if (!id) {
        throw new Error('noMoreArchive')
      }
      const trans = getArchivedStockTrans(id)
      if (trans.length > 0) {
        dispatch({type: 'ADD_ARCHIVED_STOCK_TRANS', payload: trans})
      }
      lastMonth.current++
  } catch(err) {
      setError(getMessage(f7.views.current.router.currentRoute.path, err))
    }
  }

  return(
    <Page>
      <Navbar title={labels.archivedStockTrans} backLink={labels.back} />
      <Block>
        <List mediaList>
          {stockTrans.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : stockTrans.map((t: any) => 
              <ListItem
                link={`/stock-trans-details/${t.id}/type/a`}
                title={`${t.stockTransTypeInfo.name} ${t.storeId ? t.storeInfo.name : ''}`}
                subtitle={moment(t.time.toDate()).fromNow()}
                after={(t.total / 100).toFixed(2)}
                key={t.id}
              />
            )
          }
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleRetreive()}>
        <Icon material="cached"></Icon>
      </Fab>
      <Toolbar bottom>
        <Footer/>
      </Toolbar>
    </Page>
  )
}

export default ArchivedStockTrans
