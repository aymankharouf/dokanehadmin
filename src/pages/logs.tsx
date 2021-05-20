import {useContext, useState, useEffect} from 'react'
import moment from 'moment'
import 'moment/locale/ar'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import {deleteLog, getMessage} from '../data/actions'
import {Log, User } from '../data/types'
import { IonContent, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, useIonAlert, useIonToast } from '@ionic/react'
import { useLocation } from 'react-router'
import Header from './header'
import { trashOutline } from 'ionicons/icons'
import { randomColors } from '../data/config'

type ExtendedLog = Log & {
  userInfo: User
}
const Logs = () => {
  const {state} = useContext(StateContext)
  const [message] = useIonToast()
  const location = useLocation()
  const [alert] = useIonAlert()
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
    alert({
      header: labels.confirmationTitle,
      message: labels.confirmationText,
      buttons: [
        {text: labels.cancel},
        {text: labels.ok, handler: () => {
          try{
            deleteLog(log)
            message(labels.deleteSuccess, 3000)
          } catch(err) {
            message(getMessage(location.pathname, err), 3000)
          }    
        }},
      ],
    })
  }
  return(
    <IonPage>
      <Header title={labels.logs} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {logs.length === 0 ?
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : logs.map(l => 
              <IonItem key={l.id}>
                <IonLabel>
                  <IonText color={randomColors[0].name}>{`${labels.user}: ${l.userInfo?.name || l.userId}`}</IonText>
                  <IonText color={randomColors[1].name}>{l.userInfo?.mobile ? `${labels.mobile}: ${l.userInfo.mobile}` : ''}</IonText>
                  <IonText color={randomColors[2].name}>{l.page}</IonText>
                  <IonText color={randomColors[3].name}>{l.error}</IonText>
                  <IonText color={randomColors[4].name}>{moment(l.time).fromNow()}</IonText>
                </IonLabel>
                <IonIcon 
                  ios={trashOutline} 
                  slot="end" 
                  color="danger"
                  style={{fontSize: '20px', marginRight: '10px'}} 
                  onClick={()=> handleDelete(l)}
                />
              </IonItem>    
            )
          }
        </IonList>
      </IonContent>
    </IonPage>
  )
}

export default Logs
