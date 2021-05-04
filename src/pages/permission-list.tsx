import {useContext, useState, useEffect} from 'react'
import {Page, Block, Navbar, List, ListItem, NavRight, Searchbar, Link} from 'framework7-react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import {User} from '../data/types'
import moment from 'moment'
import 'moment/locale/ar'

const PermissionList = () => {
  const {state} = useContext(StateContext)
  const [users, setUsers] = useState<User[]>([])
  useEffect(() => {
    setUsers(() => {
      const users = state.users.filter(u => (u.storeName && !u.storeId) || (!u.storeName && !u.position.lat && !u.locationId))
      return users.sort((u1, u2) => u1.time > u2.time ? 1 : -1)
    })
  }, [state.stores, state.users])
  return(
    <Page>
      <Navbar title={labels.newUsers} backLink={labels.back}>
      <NavRight>
          <Link searchbarEnable=".searchbar" iconMaterial="search"></Link>
        </NavRight>
        <Searchbar
          className="searchbar"
          searchContainer=".search-list"
          searchIn=".item-inner"
          clearButton
          expandable
          placeholder={labels.search}
        />
      </Navbar>
      <Block>
        <List className="searchbar-not-found">
          <ListItem title={labels.noData} />
        </List>
        <List mediaList className="search-list searchbar-found">
          {users.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : users.map(u => 
              <ListItem
                link={`/permit-user/${u.id}`}
                title={u.name}
                subtitle={u.storeName}
                text={moment(u.time).fromNow()}
                key={u.id}
              />
            )
          }
        </List>
      </Block>
    </Page>
  )
}

export default PermissionList
