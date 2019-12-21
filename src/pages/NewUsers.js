import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/Store';


const NewUsers = props => {
  const { state } = useContext(StoreContext)
  const newUsers = useMemo(() => {
    const newUsers = state.users.filter(u => !state.customers.find(c => c.id === u.id))
    return newUsers.sort((u1, u2) => u1.time.seconds - u2.time.seconds)
  }, [state.users, state.customers])
  return(
    <Page>
      <Navbar title={state.labels.newUsers} backLink={state.labels.back} className="page-title" />
      <Block>
        <List mediaList>
          {newUsers.length === 0 ? 
            <ListItem title={state.labels.noData} /> 
          : newUsers.map(u => 
              <ListItem
                link={`/approveUser/${u.id}`}
                title={`${u.name} ${u.mobile}`}
                subtitle={moment(u.time.toDate()).fromNow()}
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
