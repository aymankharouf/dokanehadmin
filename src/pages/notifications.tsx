import {useContext, useState, useEffect} from 'react'
import {f7, Page, Block, Navbar, List, ListItem, Fab, Icon, Button} from 'framework7-react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import moment from 'moment'
import 'moment/locale/ar'
import {deleteNotification, getMessage} from '../data/actions'
import {Notification, User } from '../data/types'
import { useIonToast } from '@ionic/react'
import { useHistory, useLocation } from 'react-router'

type ExtendedNotification = Notification & {
  userInfo: User
}
const Notifications = () => {
  const {state} = useContext(StateContext)
  const [message] = useIonToast()
  const location = useLocation()
  const [notifications, setNotifications] = useState<ExtendedNotification[]>([])
  useEffect(() => {
    setNotifications(() => {
      const notifications = state.notifications.map(n => {
        const userInfo = state.users.find(u => u.id === n.userId)!
        return {
          ...n,
          userInfo
        }
      })
      return notifications.sort((n1, n2) => n2.time > n1.time ? -1 : 1)
    })
  }, [state.users, state.notifications])
  const handleDelete = (userInfo: User, notificationId: string) => {
    f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, () => {
      try{
        deleteNotification(userInfo, notificationId, state.notifications)
        message(labels.deleteSuccess, 3000)
      } catch(err) {
        message(getMessage(location.pathname, err), 3000)
      }
    })  
  }

  if (!state.user) return <Page><h3 className="center"><a href="/login/">{labels.relogin}</a></h3></Page>
  return (
    <Page>
      <Navbar title={labels.notifications} backLink={labels.back} />
      <Block>
        <List mediaList>
          {notifications.length === 0 ? 
            <ListItem title={labels.noData} />
          : notifications.map(n =>
              <ListItem
                title={`${n.userInfo.name}:${n.userInfo.mobile}`}
                subtitle={n.title}
                text={n.message}
                footer={moment(n.time).fromNow()}
                key={n.id}
              >
                <Button text={labels.delete} slot="after" onClick={() => handleDelete(n.userInfo, n.id)} />
              </ListItem>
            )
          }
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" href="/add-notification/">
        <Icon material="add"></Icon>
      </Fab>
    </Page>
  )
}

export default Notifications
