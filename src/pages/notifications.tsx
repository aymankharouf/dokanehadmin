import {useContext, useState, useEffect} from 'react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import moment from 'moment'
import 'moment/locale/ar'
import {deleteNotification, getMessage} from '../data/actions'
import {Notification, User } from '../data/types'
import { IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, useIonAlert, useIonToast } from '@ionic/react'
import { useLocation } from 'react-router'
import { addOutline, trashOutline } from 'ionicons/icons'
import Header from './header'

type ExtendedNotification = Notification & {
  userInfo: User
}
const Notifications = () => {
  const {state} = useContext(StateContext)
  const [message] = useIonToast()
  const location = useLocation()
  const [alert] = useIonAlert()
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
    alert({
      header: labels.confirmationTitle,
      message: labels.confirmationText,
      buttons: [
        {text: labels.cancel},
        {text: labels.ok, handler: () => {
          try{
            deleteNotification(userInfo, notificationId, state.notifications)
            message(labels.deleteSuccess, 3000)
          } catch(err) {
            message(getMessage(location.pathname, err), 3000)
          }    
        }},
      ],
    })
  }

  return (
    <IonPage>
      <Header title={labels.notifications} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {notifications.length === 0 ?
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : notifications.map(n => 
              <IonItem key={n.id}>
                <IonLabel>
                  <div className="list-row1">{`${n.userInfo.name}:${n.userInfo.mobile}`}</div>
                  <div className="list-row2">{n.title}</div>
                  <div className="list-row3">{n.message}</div>
                  <div className="list-row4">{moment(n.time).fromNow()}</div>
                </IonLabel>
                <IonIcon 
                  ios={trashOutline} 
                  slot="end" 
                  color="danger"
                  style={{fontSize: '20px', marginRight: '10px'}} 
                  onClick={()=> handleDelete(n.userInfo, n.id)}
                />
              </IonItem>    
            )
          }
        </IonList>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton routerLink="/add-notification">
          <IonIcon ios={addOutline} />
        </IonFabButton>
      </IonFab>
    </IonPage>
  )
}

export default Notifications
