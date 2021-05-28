import {useContext} from 'react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import { IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage } from '@ionic/react'
import Header from './header'
import { addOutline } from 'ionicons/icons'

const Regions = () => {
  const {state} = useContext(StateContext)
  return (
    <IonPage>
      <Header title={labels.regions} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {state.regions.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : state.regions.map(r =>
              <IonItem key={r.id} routerLink={`/edit-region/${r.id}`}>
                <IonLabel>{r.name}</IonLabel>
              </IonItem>  
            )
          }
        </IonList>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton routerLink="/add-region">
          <IonIcon ios={addOutline} />
        </IonFabButton>
      </IonFab>
    </IonPage>
  )
}

export default Regions
