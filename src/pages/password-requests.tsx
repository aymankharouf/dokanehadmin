import {useContext} from 'react'
import moment from 'moment'
import 'moment/locale/ar'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import { IonContent, IonItem, IonLabel, IonList, IonPage, IonText } from '@ionic/react'
import Header from './header'
import { colors } from '../data/config'

const PasswordRequests = () => {
  const {state} = useContext(StateContext)

  return(
    <IonPage>
      <Header title={labels.passwordRequests} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {state.passwordRequests.length === 0 ?
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : state.passwordRequests.map(r => 
              <IonItem key={r.id} routerLink={`/retreive-password/${r.id}`}>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{r.mobile}</IonText>
                  <IonText style={{color: colors[1].name}}>{moment(r.time).fromNow()}</IonText>
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
