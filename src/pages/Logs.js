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
                  title={`${userInfo ? userInfo.name + ' - ' + userInfo.mobile : l.userId}`}
                  after={moment(l.time.toDate()).fromNow()}
                  subtitle={l.page}
                  text={l.error}
                  key={l.id}
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

export default Logs
