import { useContext, useState, useEffect } from 'react'
import { Page, Block, Navbar, List, ListItem } from 'framework7-react'
import moment from 'moment'
import 'moment/locale/ar'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { alarmTypes } from '../data/config'

const Alarms = () => {
  const { state } = useContext(StateContext)
  const [alarms, setAlarms] = useState<any>([])
  useEffect(() => {
    setAlarms(() => {
      let alarms = state.alarms.filter((a: any) => a.status === 'n')
      alarms = alarms.map((a: any) => {
        const userInfo = state.users.find((u: any) => u.id === a.userId)
        const alarmTypeInfo = alarmTypes.find((t: any) => t.id === a.type)
        const packInfo = state.packs.find((p: any) => p.id === a.packId)
        const customerInfo = state.customers.find((c: any) => c.id === a.userId)
        return {
          ...a,
          userInfo,
          customerInfo,
          packInfo,
          alarmTypeInfo
        }
      })
      return alarms.sort((a1: any, a2: any) => a1.time.seconds - a2.time.seconds)
    })
  }, [state.alarms, state.packs, state.users, state.customers])
  return(
    <Page>
      <Navbar title={labels.alarms} backLink={labels.back} />
      <Block>
          <List mediaList>
            {alarms.length === 0 ? 
              <ListItem title={labels.noData} /> 
            : alarms.map((a: any) => 
                <ListItem
                  link={`/alarm-details/${a.id}/user/${a.userInfo.id}`}
                  title={a.alarmTypeInfo.name}
                  subtitle={a.customerInfo.name}
                  text={`${a.packInfo.productName} ${a.packInfo.name}`}
                  footer={moment(a.time.toDate()).fromNow()}
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
