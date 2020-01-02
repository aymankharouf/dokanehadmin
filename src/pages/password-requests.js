import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar} from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'

const PasswordRequests = props => {
  const { state } = useContext(StoreContext)
  const passwordRequests = useMemo(() => {
    let passwordRequests = state.passwordRequests.filter(r => r.status === 'n')
    passwordRequests = passwordRequests.map(r => {
      const userInfo = state.users.find(u => u.mobile === r.mobile)
      return {
        ...r,
        userInfo
      }
    })
    passwordRequests = passwordRequests.filter(r => r.userInfo)
    return passwordRequests.sort((r1, r2) => r1.time.seconds - r2.time.seconds)
  } , [state.passwordRequests, state.users])
  return(
    <Page>
      <Navbar title={labels.passwordRequests} backLink={labels.back} />
      <Block>
          <List mediaList>
            {passwordRequests.length === 0 ? 
              <ListItem title={labels.noData} /> 
            : passwordRequests.map(r => 
                <ListItem
                  link={`/retreive-password/${r.id}`}
                  title={`${labels.user}: ${r.userInfo.name}`}
                  subtitle={`${labels.mobile}: ${r.userInfo.mobile}`}
                  text={moment(r.time.toDate()).fromNow()}
                  key={r.id}
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

export default PasswordRequests
