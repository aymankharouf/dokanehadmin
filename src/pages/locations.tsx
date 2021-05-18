import {useContext, useState, useEffect} from 'react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import { IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage } from '@ionic/react'
import Header from './header'
import { addOutline } from 'ionicons/icons'

const Locations = () => {
  const {state} = useContext(StateContext)
  const [locations, setLocations] = useState(() => [...state.locations].sort((l1, l2) => l1.name > l2.name ? 1 : -1))
  useEffect(() => {
    setLocations(() => [...state.locations].sort((l1, l2) => l1.name > l2.name ? 1 : -1))
  }, [state.locations])
  return (
    <IonPage>
      <Header title={labels.locations} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {locations.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : locations.map(l =>
              <IonItem key={l.id} routerLink={`/edit-location/${l.id}`}>
                <IonLabel>{l.name}</IonLabel>
              </IonItem>  
            )
          }
        </IonList>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton routerLink="/add-location">
          <IonIcon ios={addOutline} />
        </IonFabButton>
      </IonFab>
    </IonPage>
  )
}

export default Locations
