import {useContext, useState, useEffect} from 'react'
import {Page, Block, Navbar, List, ListItem} from 'framework7-react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import {User} from '../data/types'

type Props = {
  id: string
}
type ExtendedUser = User & {userInfo: User}
const StoreOwners = (props: Props) => {
  const {state} = useContext(StateContext)
  const [store] = useState(() => state.stores.find(s => s.id === props.id)!)
  const [storeOwners, setStoreOwners] = useState<ExtendedUser[]>([])
  useEffect(() => {
    setStoreOwners(() => {
      const storeOwners = state.users.filter(u => u.storeId === props.id)
      const results = storeOwners.map(o => {
        const userInfo = state.users.find(u => u.id === o.id)!
        return {
          ...o,
          userInfo,
        }
      })
      return results
    })
  }, [state.users, props.id])
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
                title={o.userInfo.name} 
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
