import { useContext, useState, useEffect } from 'react'
import { Page, Block, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import Footer from './footer'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'


const Invitations = () => {
  const { state } = useContext(StateContext)
  const [invitations, setInvitations] = useState<any>([])
  useEffect(() => {
    setInvitations(() => {
      const invitations = state.invitations.filter((i: any) => i.status === 'n')
      return invitations.map((i: any) => {
        const userInfo = state.users.find((u: any) => u.id === i.userId)
        return {
          ...i,
          userInfo
        }
      })
    })
  }, [state.users, state.invitations])
  let j = 0
  return(
    <Page>
      <Navbar title={labels.invitations} backLink={labels.back} />
      <Block>
        <List mediaList>
          {invitations.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : invitations.map((i: any) => 
              <ListItem
                link={`/invitation-details/${i.userInfo.id}/mobile/${i.mobile}`}
                title={`${i.userInfo.name}: ${i.userInfo.mobile}`}
                subtitle={`${i.name}: ${i.mobile}`}
                key={j++}
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

export default Invitations
