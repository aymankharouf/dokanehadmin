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
    let alarms = []
    let users = state.users.filter(u => u.alarms?.find(a => a.status === 'n'))
    users.forEach(u => {
      u.alarms.forEach(a => {
        if (a.status === 'n') {
          const alarmTypeInfo = alarmTypes.find(t => t.id === a.type)
          const packInfo = state.packs.find(p => p.id === a.packId)
          const customerInfo = state.customers.find(c => c.id === u.id)
          alarms.push({
            ...a,
            packInfo,
            userInfo: u,
            customerInfo,
            alarmTypeInfo
          })
        }
      })
    })
   return alarms.sort((a1, a2) => a1.time.seconds - a2.time.seconds)
  }, [state.packs, state.users, state.customers])
  return(
    <Page>
      <Navbar title={labels.alarms} backLink={labels.back} />
      <Block>
          <List mediaList>
            {alarms.length === 0 ? 
              <ListItem title={labels.noData} /> 
            : alarms.map(a => 
                <ListItem
                  link={`/alarm-details/${a.id}/user/${a.userInfo.id}`}
                  title={a.alarmTypeInfo.name}
                  subtitle={a.customerInfo.fullName}
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
