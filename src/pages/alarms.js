import { useContext, useState, useEffect } from 'react'
import { Page, Block, Navbar, List, ListItem } from 'framework7-react'
import Footer from './footer'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { alarmTypes } from '../data/config'

const Alarms = () => {
  const { state } = useContext(StoreContext)
  const [alarms, setAlarms] = useState([])
  useEffect(() => {
    setAlarms(() => {
      let alarms = state.alarms.filter(a => a.status === 'n')
      alarms = alarms.map(a => {
        const userInfo = state.users.find(u => u.id === a.userId)
        const alarmTypeInfo = alarmTypes.find(t => t.id === a.type)
        const packInfo = state.packs.find(p => p.id === a.packId)
        const customerInfo = state.customers.find(c => c.id === a.userId)
        return {
          ...a,
          userInfo,
          customerInfo,
          packInfo,
          alarmTypeInfo
        }
      })
      return alarms.sort((a1, a2) => a1.time.seconds - a2.time.seconds)
    })
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
      <Footer/>
    </Page>
  )
}

export default Alarms
