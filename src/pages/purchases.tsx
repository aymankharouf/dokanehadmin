import { useContext, useState, useEffect } from 'react'
import { f7, Page, Block, Navbar, List, ListItem, Fab, Icon, Toolbar } from 'framework7-react'
import Footer from './footer'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'

const Purchases = () => {
  const { state } = useContext(StoreContext)
  const [purchases, setPurchases] = useState([])
  useEffect(() => {
    setPurchases(() => {
      const purchases = state.purchases.map((p: any) => {
        const storeInfo = state.stores.find((s: any) => s.id === p.storeId)
        return {
          ...p,
          storeInfo
        }
      })
      return purchases.sort((p1: any, p2: any) => p2.time.seconds - p1.time.seconds)
    })
  }, [state.purchases, state.stores])

  if (!state.user) return <Page><h3 className="center"><a href="/login/">{labels.relogin}</a></h3></Page>
  return(
    <Page>
      <Navbar title={labels.purchases} backLink={labels.back} />
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => f7.views.current.router.navigate('/archived-purchases/')}>
        <Icon material="backup"></Icon>
      </Fab>
      <Block>
        <List mediaList>
          {purchases.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : purchases.map((p: any) => 
              <ListItem
                link={`/purchase-details/${p.id}/type/n`}
                title={p.storeInfo.name}
                subtitle={moment(p.time.toDate()).fromNow()}
                after={(p.total / 100).toFixed(2)}
                key={p.id}
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

export default Purchases