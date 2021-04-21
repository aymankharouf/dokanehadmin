import { useContext, useState, useEffect } from 'react'
import { Page, Block, Navbar, List, ListItem } from 'framework7-react'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { Customer } from '../data/interfaces'

interface Props {
  id: string
}
type ExtendedCustomer = Customer & {customerInfo: Customer}
const StoreOwners = (props: Props) => {
  const { state } = useContext(StateContext)
  const [store] = useState(() => state.stores.find(s => s.id === props.id)!)
  const [storeOwners, setStoreOwners] = useState<ExtendedCustomer[]>([])
  useEffect(() => {
    setStoreOwners(() => {
      const storeOwners = state.customers.filter(c => c.storeId === props.id)
      const results = storeOwners.map(o => {
        const customerInfo = state.customers.find(c => c.id === o.id)!
        return {
          ...o,
          customerInfo,
        }
      })
      return results
    })
  }, [state.customers, props.id])
  return (
    <Page>
      <Navbar title={`${labels.storeOwners} ${store.name}`} backLink={labels.back} />
      <Block>
        <List mediaList>
          {storeOwners.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : storeOwners.map(o => 
              <ListItem 
                link="#"
                title={o.customerInfo.name} 
                key={o.id} 
              />
            )
          }
        </List>
      </Block>
    </Page>
  )
}

export default StoreOwners
