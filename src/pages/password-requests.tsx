import {useContext, useState} from 'react'
import moment from 'moment'
import 'moment/locale/ar'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import { IonContent, IonItem, IonLabel, IonList, IonPage, IonText } from '@ionic/react'
import Header from './header'
import { randomColors } from '../data/config'

const PasswordRequests = () => {
  const {state} = useContext(StateContext)
  const [passwordRequests] = useState(() => state.passwordRequests.sort((r1, r2) => r1.time > r2.time ? -1 : 1))

  return(
    <IonPage>
      <Header title={labels.passwordRequests} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {passwordRequests.length === 0 ?
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : passwordRequests.map(r => 
              <IonItem key={r.id} routerLink={`/retreive-password/${r.id}`}>
                <IonLabel>
                  <IonText color={randomColors[0].name}>{r.mobile}</IonText>
                  <IonText color={randomColors[1].name}>{r.status === 'n' ? labels.new : labels.resolved}</IonText>
                  <IonText color={randomColors[2].name}>{moment(r.time).fromNow()}</IonText>
                </IonLabel>
              </IonItem>    
            )
          }
        </IonList>
      </IonContent>
    </IonPage>
  )
}

export default PasswordRequests
