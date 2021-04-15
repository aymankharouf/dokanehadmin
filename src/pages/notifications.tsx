import { useContext, useState, useEffect } from 'react'
import { f7, Page, Block, Navbar, List, ListItem, Fab, Icon, Button, Toolbar } from 'framework7-react'
import Footer from './footer'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import moment from 'moment'
import 'moment/locale/ar'
import { deleteNotification, showMessage, showError, getMessage } from '../data/actions'

const Notifications = () => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [notifications, setNotifications] = useState<any>([])
  useEffect(() => {
    setNotifications(() => {
      const notifications = state.notifications.map((n: any) => {
        const userInfo = state.users.find((u: any) => u.id === n.userId)
        return {
          ...n,
          userInfo
        }
      })
      return notifications.sort((n1: any, n2: any) => n2.time.seconds - n1.time.seconds)
    })
  }, [state.users, state.notifications])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleDelete = (userInfo: any, notificationId: any) => {
    f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, () => {
      try{
        deleteNotification(userInfo, notificationId,)
        showMessage(labels.deleteSuccess)
      } catch(err) {
        setError(getMessage(f7.views.current.router.currentRoute.path, err))
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
          : notifications.map((n: any) =>
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
        <Footer/>
      </Toolbar>
    </Page>
  )
}

export default Notifications
