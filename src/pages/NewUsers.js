import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, NavRight, Link, Searchbar} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/Store';


const NewUsers = props => {
  const { state } = useContext(StoreContext)
  const newUsers = useMemo(() => {
    let newUsers = state.users.filter(rec => rec.isActive === false)
    return newUsers.sort((rec1, rec2) => rec1.time.seconds - rec2.time.seconds)
  }, [state.users])
  return(
    <Page>
      <Navbar title={state.labels.newUsers} backLink={state.labels.back} />
      <Block>
        <List mediaList>
          {newUsers && newUsers.map(user => 
            <ListItem
              link={`/approveUser/${user.id}`}
              title={`${user.name} - ${user.mobile}`}
              subtitle={moment(user.time.toDate()).fromNow()}
              key={user.id}
            />
          )}
          {newUsers.length === 0 ? <ListItem title={state.labels.noData} /> : ''}
        </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default NewUsers
