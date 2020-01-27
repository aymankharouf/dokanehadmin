import React, { useContext, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'


const Invitations = props => {
  const { state } = useContext(StoreContext)
  const [invitations, setInvitations] = useState([])
  useEffect(() => {
    setInvitations(() => {
      let invitations = []
      let users = state.users.filter(u => u.invitations?.find(i => i.status === 'n'))
      users.forEach(u => {
        u.invitations.forEach(i => {
          if (i.status === 'n') {
            invitations.push({
              userInfo: u,
              name: i.name,
              mobile: i.mobile
            })
          }
        })
      })
      return invitations
    })
  }, [state.users])
  let j = 0
  return(
    <Page>
      <Navbar title={labels.invitations} backLink={labels.back} />
      <Block>
        <List mediaList>
          {invitations.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : invitations.map(i => 
              <ListItem
                link={`/invitation-details/${i.userInfo.id}/mobile/${i.mobile}`}
                title={`${i.userInfo.name}:${i.userInfo.mobile}`}
                subtitle={`${i.name}: ${i.mobile}`}
                key={j++}
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
