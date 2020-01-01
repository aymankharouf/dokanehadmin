import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar} from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'

const ForgetPasswords = props => {
  const { state } = useContext(StoreContext)
  const forgetPasswords = useMemo(() => {
    const forgetpasswords = state.forgetPasswords.filter(f => f.status === 'n')
    return forgetpasswords.sort((f1, f2) => f1.time.seconds - f2.time.seconds)
  } , [state.forgetPasswords])
  return(
    <Page>
      <Navbar title={labels.forgetPasswords} backLink={labels.back} />
      <Block>
          <List mediaList>
            {forgetPasswords.length === 0 ? 
              <ListItem title={labels.noData} /> 
            : forgetPasswords.map(f => {
                const userInfo = state.users.find(u => u.mobile === f.mobile)
                if (!userInfo) return ''
                return (
                  <ListItem
                    link={`/retreive-password/${f.id}`}
                    title={`${labels.user}: ${userInfo.name}`}
                    subtitle={`${labels.mobile}: ${userInfo.mobile}`}
                    text={moment(f.time.toDate()).fromNow()}
                    key={f.id}
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

export default ForgetPasswords
