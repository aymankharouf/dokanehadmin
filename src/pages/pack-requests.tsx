import {useContext, useState, useEffect} from 'react'
import moment from 'moment'
import 'moment/locale/ar'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import {PackRequest} from '../data/types'
import { IonContent, IonItem, IonLabel, IonList, IonPage, IonText } from '@ionic/react'
import Header from './header'
import { randomColors } from '../data/config'

const PackRequests = () => {
  const {state} = useContext(StateContext)
  const [packRequests, setPackRequests] = useState<PackRequest[]>([])
  useEffect(() => {
    setPackRequests(() => [...state.packRequests].sort((r1, r2) => r1.time > r2.time ? -1 : 1))
  }, [state.packRequests])
  return(
    <IonPage>
      <Header title={labels.packRequests} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {packRequests.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem> 
          : packRequests.map(r =>
              <IonItem key={r.id} routerLink={`/pack-request-details/${r.id}`}>
                <IonLabel>
                  <IonText color={randomColors[0].name}>{state.packs.find(p => p.id === r.siblingPackId)?.product.name}</IonText>
                  <IonText color={randomColors[1].name}>{r.name}</IonText>
                  <IonText color={randomColors[2].name}>{`${labels.price}: ${r.price.toFixed(2)}`}</IonText>
                  <IonText color={randomColors[3].name}>{moment(r.time).fromNow()}</IonText>
                </IonLabel>
              </IonItem> 
            )
          }
        </IonList>
      </IonContent>
    </IonPage>
  )
}

export default PackRequests
