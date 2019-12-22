import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/Store';


const Logs = props => {
  const { state } = useContext(StoreContext)
  const logs = useMemo(() => [...state.logs].sort((l1, l2) => l2.time.seconds - l1.time.seconds)
  , [state.logs])
  return(
    <Page>
      <Navbar title={state.labels.logs} backLink={state.labels.back} className="page-title" />
      <Block>
        <List mediaList>
          {logs.length === 0 ? 
            <ListItem title={state.labels.noData} /> 
          : logs.map(l => {
              const userInfo = state.users.find(u => u.id === l.userId)
              return (
                <ListItem
                  title={`${state.labels.user}: ${userInfo?.name ?? l.userId}`}
                  key={l.id}
                >
                  {userInfo?.mobile ? <div className="list-line1">{`${state.labels.mobile}: ${userInfo.mobile}`}</div> : ''}
                  <div className="list-line2">{moment(l.time.toDate()).fromNow()}</div>
                  <div className="list-line3">{l.page}</div>
                  <div className="list-line4">{l.error}</div>
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
