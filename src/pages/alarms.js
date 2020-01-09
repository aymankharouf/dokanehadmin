import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar} from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import PackImage from './pack-image'
import labels from '../data/labels'
import { alarmTypes } from '../data/config'

const Alarms = props => {
  const { state } = useContext(StoreContext)
  const alarms = useMemo(() => {
    let alarms = state.alarms.filter(a => a.status === 'n')
    alarms = alarms.map(a => {
      const alarmTypeInfo = alarmTypes.find(t => t.id === a.alarmType)
      const packInfo = state.packs.find(p => p.id === a.packId)
      const userInfo = state.users.find(u => u.id === a.userId)
      const customerInfo = state.customers.find(c => c.id === a.userId)
      return {
        ...a,
        packInfo,
        userInfo,
        customerInfo,
        alarmTypeInfo,
      }
    })
    return alarms.sort((a1, a2) => a1.time.seconds - a2.time.seconds)
  }, [state.alarms, state.packs, state.users, state.customers])
  return(
    <Page>
      <Navbar title={labels.alarms} backLink={labels.back} />
      <Block>
          <List mediaList>
            {alarms.length === 0 ? 
              <ListItem title={labels.noData} /> 
            : alarms.map(a => 
                <ListItem
                  link={`/alarm-details/${a.id}`}
                  title={a.alarmTypeInfo.name}
                  subtitle={a.customerInfo.fullName || `${a.userInfo.name}:${a.userInfo.mobile}`}
                  text={`${a.packInfo.productName} ${a.packInfo.name}`}
                  footer={moment(a.time.toDate()).fromNow()}
                  key={a.id}
                >
                  <PackImage slot="media" pack={a.packInfo} type="list" />
                </ListItem>
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

export default Alarms
