import { useContext, useState, useEffect } from 'react'
import { Page, Block, Navbar, List, ListItem, NavRight, Link, Searchbar } from 'framework7-react'
import moment from 'moment'
import 'moment/locale/ar'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { User } from '../data/types'

const Users = () => {
  const { state } = useContext(StateContext)
  const [users, setUsers] = useState<User[]>([])
  useEffect(() => {
    setUsers(() => [...state.users].sort((u1, u2) => u2.time > u1.time ? -1 : 1))
  }, [state.users])
  if (!state.user) return <Page><h3 className="center"><a href="/login/">{labels.relogin}</a></h3></Page>
  return(
    <Page>
      <Navbar title={labels.users} backLink={labels.back}>
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
                title={u.name}
                subtitle={u.mobile}
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

export default Users
