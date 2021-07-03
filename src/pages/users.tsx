import { useContext, useState, useEffect } from 'react'
import moment from 'moment'
import 'moment/locale/ar'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { User } from '../data/types'
import { colors, userTypes } from '../data/config'
import { useLocation, useParams } from 'react-router'
import { IonBadge, IonContent, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, useIonAlert, useIonToast } from '@ionic/react'
import Header from './header'
import { mailOutline } from 'ionicons/icons'
import { getMessage, sendNotification } from '../data/actions'

type Params = {
  id: string
}
const Users = () => {
  const { state } = useContext(StateContext)
  const params = useParams<Params>()
  const [message] = useIonToast()
  const [alert] = useIonAlert()
  const location = useLocation()
  const [users, setUsers] = useState<User[]>([])
  useEffect(() => {
    setUsers(() => {
      const users = state.users.filter(u => u.type === params.id)
      return users.sort((u1, u2) => u1.time > u2.time ? -1 : 1)
    })
  }, [state.users, params.id])
  const handleNotify = (userId: string) => {
    try {
      alert({
        header: labels.enterMessage,
        inputs: [{name: 'message', type: 'text'}],
        buttons: [
          {text: labels.cancel},
          {text: labels.ok, handler: (e) => {
            sendNotification(userId, labels.notification, e.message)
            message(labels.sendSuccess, 3000)
          }}
        ],
      })
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return(
    <IonPage>
      <Header title={userTypes.find(t => t.id === params.id)?.name} />
      <IonContent fullscreen>
        <IonList className="ion-padding">
          {users.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : users.map(u =>
              <IonItem key={u.id}>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{`${labels.name}: ${u.name}`}</IonText>
                  <IonText style={{color: colors[1].name}}>{`${labels.mobile}: ${u.mobile}`}</IonText>
                  {u.storeName && <IonText style={{color: colors[2].name}}>{`${labels.storeName}: ${u.storeName}`}</IonText>}
                  {u.regionId && <IonText style={{color: colors[3].name}}>{`${labels.region}: ${state.regions.find(r => r.id === u.regionId)?.name}`}</IonText>}
                  {u.address && <IonText style={{color: colors[4].name}}>{`${labels.address}: ${u.address}`}</IonText>}
                  <IonText style={{color: colors[5].name}}>{moment(u.time).fromNow()}</IonText>
                </IonLabel>
                {!u.isActive && <IonBadge color="danger">{labels.inActive}</IonBadge>}
                <IonIcon 
                  ios={mailOutline} 
                  slot="end" 
                  color="danger"
                  style={{fontSize: '20px', marginRight: '10px'}} 
                  onClick={()=> handleNotify(u.id)}
                />
              </IonItem>  
            )
          }
        </IonList>
      </IonContent>
    </IonPage>
  )
}

export default Users
