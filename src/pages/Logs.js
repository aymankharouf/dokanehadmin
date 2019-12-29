import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'


const Logs = props => {
  const { state } = useContext(StoreContext)
  const logs = useMemo(() => [...state.logs].sort((l1, l2) => l2.time.seconds - l1.time.seconds)
  , [state.logs])
  return(
    <Page>
      <Navbar title={state.labels.logs} backLink={state.labels.back} />
      <Block>
        <List mediaList>
          {logs.length === 0 ? 
            <ListItem title={state.labels.noData} /> 
          : logs.map(l => {
              const userInfo = state.users.find(u => u.id === l.userId)
              return (
                <ListItem
                  title={`${state.labels.user}: ${userInfo?.name || l.userId}`}
                  subtitle={userInfo?.mobile ? `${state.labels.mobile}: ${userInfo.mobile}` : ''}
                  text={l.page}
                  footer={moment(l.time.toDate()).fromNow()}
                  key={l.id}
                >
                  <div className="list-subtext1">{l.error}</div>
                </ListItem>
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

export default Logs
