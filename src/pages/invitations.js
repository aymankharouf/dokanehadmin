import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'


const Invitations = props => {
  const { state } = useContext(StoreContext)
  const invitations = useMemo(() => {
    let invitations = state.invitations.filter(i => i.status === 'n')
    invitations = invitations.map(i => {
      const userInfo = state.users.find(u => u.id === i.userId)
      const customerInfo = state.customers.find(c => c.id === i.userId)
      return {
        ...i,
        userInfo,
        customerInfo
      }
    })
    return invitations.sort((i1, i2) => i1.time.seconds - i2.time.seconds)
  }, [state.invitations, state.users, state.customers])
  return(
    <Page>
      <Navbar title={labels.invitations} backLink={labels.back} />
      <Block>
        <List mediaList>
          {invitations.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : invitations.map(i => 
              <ListItem
                link={`/invitation-details/${i.id}`}
                title={i.customerInfo.fullName || `${i.userInfo.name}:${i.userInfo.mobile}`}
                subtitle={`${i.friendName}: ${i.friendMobile}`}
                text={moment(i.time.toDate()).fromNow()}
                key={i.id}
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

export default Invitations
