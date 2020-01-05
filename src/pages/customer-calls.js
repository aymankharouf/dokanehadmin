import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { callTypes, callResults } from '../data/config'


const CustomerCalls = props => {
  const { state } = useContext(StoreContext)
  const calls = useMemo(() => {
    let calls = state.calls.filter(c => c.userId === props.id)
    calls = calls.map(c => {
      const callTypeInfo = callTypes.find(t => t.id === c.callType)
      const callResultInfo = callResults.find(r => r.id === c.callResult)
      return {
        ...c,
        callTypeInfo,
        callResultInfo
      }
    })
    return calls.sort((c1, c2) => c2.time.seconds - c1.time.seconds)
  }, [state.calls, props.id]) 
  return(
    <Page>
      <Navbar title={`${labels.callsTo} ${state.customers.find(c => c.id === props.id).fullName}`} backLink={labels.back} />
      <Block>
        <List mediaList>
          {calls.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : calls.map(c => 
              <ListItem
                title={c.callTypeInfo.name}
                subtitle={c.callResultInfo.name}
                text={moment(c.time.toDate()).fromNow()}
                key={c.id}
              />
            )
          }
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" href={`/add-call/${props.id}`}>
        <Icon material="add"></Icon>
      </Fab>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default CustomerCalls
