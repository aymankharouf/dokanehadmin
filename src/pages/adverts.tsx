import {useContext, useState, useEffect} from 'react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import moment from 'moment'
import 'moment/locale/ar'
import {colors} from '../data/config'
import {Advert} from '../data/types'
import { IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText } from '@ionic/react'
import Header from './header'
import { addOutline } from 'ionicons/icons'

const Adverts = () => {
  const {state} = useContext(StateContext)
  const [adverts, setAdverts] = useState<Advert[]>([])
  useEffect(() => {
    setAdverts(() => [...state.adverts].sort((a1, a2) => a2.time > a1.time ? 1 : -1))
  }, [state.adverts])
  return (
    <IonPage>
      <Header title={labels.adverts} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {adverts.length === 0 ?
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : adverts.map(a => 
              <IonItem key={a.id} routerLink={`/advert-details/${a.id}`}>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{a.title}</IonText>
                  <IonText style={{color: colors[1].name}}>{`${moment(a.startDate.toString(), 'YYYYMMDD').format('YYYY/MM/DD')} - ${moment(a.endDate.toString(), 'YYYYMMDD').format('YYYY/MM/DD')}`}</IonText>
                  <IonText style={{color: colors[2].name}}>{moment(a.time).fromNow()}</IonText>
                </IonLabel>
              </IonItem>    
            )
          }
        </IonList>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton routerLink="/add-advert">
          <IonIcon ios={addOutline} />
        </IonFabButton>
      </IonFab>
    </IonPage>
  )
}

export default Adverts
