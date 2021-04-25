import { useContext, useState, useEffect } from 'react'
import { Page, Block, Navbar, List, ListItem } from 'framework7-react'
import moment from 'moment'
import 'moment/locale/ar'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { alarmTypes } from '../data/config'
import { Alarm, AlarmType, Pack, User } from '../data/types'

type ExtendedAlarms = Alarm & {
  userInfo: User,
  packInfo: Pack,
  alarmTypeInfo: AlarmType
}
const Alarms = () => {
  const { state } = useContext(StateContext)
  const [alarms, setAlarms] = useState<ExtendedAlarms[]>([])
  useEffect(() => {
    setAlarms(() => {
      const alarms = state.alarms.filter(a => a.status === 'n')
      const results = alarms.map(a => {
        const userInfo = state.users.find(u => u.id === a.userId)!
        const alarmTypeInfo = alarmTypes.find(t => t.id === a.type)!
        const packInfo = state.packs.find(p => p.id === a.packId)!
        return {
          ...a,
          userInfo,
          packInfo,
          alarmTypeInfo
        }
      })
      return results.sort((a1, a2) => a1.time > a2.time ? -1 : 1)
    })
  }, [state.alarms, state.packs, state.users])
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
                  subtitle={a.userInfo.name}
                  text={`${a.packInfo.product.name} ${a.packInfo.name}`}
                  footer={moment(a.time).fromNow()}
                  key={a.id}
                >
                  <img src={a.packInfo.imageUrl} slot="media" className="img-list" alt={labels.noImage} />
                </ListItem>
              )
            }
          </List>
      </Block>
    </Page>
  )
}

export default Alarms
