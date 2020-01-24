import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'


const NewUsers = props => {
  const { state } = useContext(StoreContext)
  const newUsers = useMemo(() => {
    const newUsers = state.users.filter(u => !state.customers.find(c => c.id === u.id))
    return newUsers.sort((u1, u2) => u2.time.seconds - u1.time.seconds)
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
                text={moment(u.time.toDate()).fromNow()}
                key={u.id}
              />
            )
          }
        </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default NewUsers
