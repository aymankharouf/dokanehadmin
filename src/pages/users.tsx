import {useContext, useState, useEffect} from 'react'
import {Page, Block, Navbar, List, ListItem, NavRight, Link, Searchbar} from 'framework7-react'
import moment from 'moment'
import 'moment/locale/ar'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import {User} from '../data/types'
import {userTypes} from '../data/config'
import { useParams } from 'react-router'

type Params = {
  id: string
}
const Users = () => {
  const {state} = useContext(StateContext)
  const params = useParams<Params>()
  const [users, setUsers] = useState<User[]>([])
  useEffect(() => {
    setUsers(() => {
      const users = state.users.filter(u => u.type === params.id)
      return users.sort((u1, u2) => u1.time > u2.time ? -1 : 1)
    })
  }, [state.users, params.id])
  if (!state.user) return <Page><h3 className="center"><a href="/login/">{labels.relogin}</a></h3></Page>
  return(
    <Page>
      <Navbar title={userTypes.find(t => t.id === params.id)?.name} backLink={labels.back}>
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
                text={u.storeName}
                footer={moment(u.time).fromNow()}
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
