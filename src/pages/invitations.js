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
    const invitations = state.invitations.filter(i => i.status === 'n')
    return invitations.sort((i1, i2) => i1.time.seconds - i2.time.seconds)
  }, [state.invitations])
  return(
    <Page>
      <Navbar title={labels.invitations} backLink={labels.back} />
      <Block>
        <List mediaList>
          {invitations.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : invitations.map(i => {
            const userInfo = state.users.find(u => u.id === i.userId)
              return (
                <ListItem
                  link={`/invitation/${i.id}`}
                  title={`${labels.user}: ${userInfo.name}`}
                  subtitle={`${labels.mobile}: ${userInfo.mobile}`}
                  text={`${i.friendName}: ${i.friendMobile}`}
                  footer={moment(i.time.toDate()).fromNow()}
                  key={i.id}
                />                
              )
            })
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
