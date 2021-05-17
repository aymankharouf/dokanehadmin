import {useContext, useState, useEffect} from 'react'
import {f7, Page, Block, Navbar, List, ListItem, Link} from 'framework7-react'
import moment from 'moment'
import 'moment/locale/ar'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import {deleteLog, getMessage} from '../data/actions'
import {Log, User } from '../data/types'
import { useIonToast } from '@ionic/react'
import { useHistory, useLocation } from 'react-router'

type ExtendedLog = Log & {
  userInfo: User
}
const Logs = () => {
  const {state} = useContext(StateContext)
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [logs, setLogs] = useState<ExtendedLog[]>([])
  useEffect(() => {
    setLogs(() => {
      const logs = state.logs.map(l => {
        const userInfo = state.users.find(u => u.id === l.userId)!
        return {
          ...l,
          userInfo
        }
      })
      return logs.sort((l1, l2) => l2.time > l1.time ? 1 : -1)
    })
  }, [state.logs, state.users])
  const handleDelete = (log: Log) => {
    try{
      deleteLog(log)
      message(labels.deleteSuccess, 3000)
    } catch(err) {
      message(getMessage(location.pathname, err), 3000)
    }
  }
  return(
    <Page>
      <Navbar title={labels.logs} backLink={labels.back} />
      <Block>
        <List mediaList>
          {logs.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : logs.map(l => 
              <ListItem
                title={`${labels.user}: ${l.userInfo?.name || l.userId}`}
                subtitle={l.userInfo?.mobile ? `${labels.mobile}: ${l.userInfo.mobile}` : ''}
                text={l.page}
                footer={moment(l.time).fromNow()}
                key={l.id}
              >
                <div className="list-subtext1">{l.error}</div>
                <Link slot="after" iconMaterial="delete" onClick={()=> handleDelete(l)}/>
              </ListItem>
            )
          }
        </List>
      </Block>
    </Page>
  )
}

export default Logs
