import { useContext, useState, useEffect } from 'react'
import { Page, Block, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import Footer from './footer'
import { StoreContext } from '../data/store'
import labels from '../data/labels'


const StoreOwners = (props: any) => {
  const { state } = useContext(StoreContext)
  const [store] = useState(() => state.stores.find((s: any) => s.id === props.id))
  const [storeOwners, setStoreOwners] = useState([])
  useEffect(() => {
    setStoreOwners(() => {
      let storeOwners = state.customers.filter((c: any) => c.storeId === props.id)
      storeOwners = storeOwners.map((o: any) => {
        const customerInfo = state.customers.find((c: any) => c.id === o.id)
        return {
          ...o,
          customerInfo,
        }
      })
      return storeOwners
    })
  }, [state.customers, props.id])
  return (
    <Page>
      <Navbar title={`${labels.storeOwners} ${store.name}`} backLink={labels.back} />
      <Block>
        <List mediaList>
          {storeOwners.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : storeOwners.map((o: any) => 
              <ListItem 
                link="#"
                title={o.customerInfo.name} 
                key={o.id} 
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

export default StoreOwners
