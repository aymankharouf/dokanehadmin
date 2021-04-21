import { useContext, useState, useEffect } from 'react'
import { Page, Block, Navbar, List, ListItem } from 'framework7-react'
import moment from 'moment'
import 'moment/locale/ar'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { User } from '../data/types'


const NewUsers = () => {
  const { state } = useContext(StateContext)
  const [newUsers, setNewUsers] = useState<User[]>([])
  useEffect(() => {
    setNewUsers(() => {
      const newUsers = state.users.filter(u => !state.customers.find(c => c.id === u.id))
      return newUsers.sort((u1, u2) => u2.time > u1.time ? -1 : 1)
    })
  }, [state.users, state.customers])
  return(
    <Page>
      <Navbar title={labels.newUsers} backLink={labels.back} />
      <Block>
        <List mediaList>
          {newUsers.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : newUsers.map(u => 
              <ListItem
                link={`/approve-user/${u.id}`}
                title={`${labels.user}: ${u.name}`}
                subtitle={`${labels.mobile}: ${u.mobile}`}
                text={u.storeName && `${labels.storeName}: ${u.storeName}`}
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

export default NewUsers
