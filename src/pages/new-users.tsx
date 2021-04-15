import { useContext, useState, useEffect } from 'react'
import { Page, Block, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import Footer from './footer'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'


const NewUsers = () => {
  const { state } = useContext(StoreContext)
  const [newUsers, setNewUsers] = useState<any>([])
  useEffect(() => {
    setNewUsers(() => {
      const newUsers = state.users.filter((u: any) => !state.customers.find((c: any) => c.id === u.id))
      return newUsers.sort((u1: any, u2: any) => u2.time.seconds - u1.time.seconds)
    })
  }, [state.users, state.customers])
  return(
    <Page>
      <Navbar title={labels.newUsers} backLink={labels.back} />
      <Block>
        <List mediaList>
          {newUsers.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : newUsers.map((u: any) => 
              <ListItem
                link={`/approve-user/${u.id}`}
                title={`${labels.user}: ${u.name}`}
                subtitle={`${labels.mobile}: ${u.mobile}`}
                text={u.storeName && `${labels.storeName}: ${u.storeName}`}
                footer={moment(u.time.toDate()).fromNow()}
                key={u.id}
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

export default NewUsers
