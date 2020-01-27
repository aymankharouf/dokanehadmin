import React, { useContext, useState, useEffect } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon, Button } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import moment from 'moment'
import 'moment/locale/ar'
import { deleteNotification, showMessage, showError, getMessage } from '../data/actions'

const Notifications = props => {
  const { state, user } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [notifications, setNotifications] = useState([])
  useEffect(() => {
    setNotifications(() => {
      let notifications = []
      let users = state.users.filter(u => u.notifications)
      users.forEach(u => {
        u.notifications.forEach(n => {
          notifications.push({
            ...n,
            userInfo: u
          })
        })
      })
      return notifications.sort((n1, n2) => n2.time.seconds - n1.time.seconds)
    })
  }, [state.users])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  useEffect(() => {
    if (inprocess) {
      f7.dialog.preloader(labels.inprocess)
    } else {
      f7.dialog.close()
    }
  }, [inprocess])

  const handleDelete = (userInfo, notificationId) => {
    f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, async () => {
      try{
        setInprocess(true)
        await deleteNotification(userInfo, notificationId,)
        setInprocess(false)
        showMessage(labels.deleteSuccess)
      } catch(err) {
        setInprocess(false)
        setError(getMessage(props, err))
      }
    })  
  }

  if (!user) return <Page><h3 className="center"><a href="/login/">{labels.relogin}</a></h3></Page>
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
                footer={moment(n.time.toDate()).fromNow()}
                key={n.id}
              >
                <div className="list-subtext1">{n.status === 'n' ? labels.notRead : labels.read}</div>
                <Button text={labels.delete} slot="after" onClick={() => handleDelete(n.userInfo, n.id)} />
              </ListItem>
            )
          }
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" href="/add-notification/">
        <Icon material="add"></Icon>
      </Fab>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Notifications
