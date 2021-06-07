import {useContext, useState, useEffect} from 'react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import {Store} from '../data/types'
import { colors, userTypes } from '../data/config'
import { IonBadge, IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText } from '@ionic/react'
import Header from './header'
import { addOutline } from 'ionicons/icons'

const Stores = () => {
  const {state} = useContext(StateContext)
  const [stores, setStores] = useState<Store[]>([])
  useEffect(() => {
    setStores(() => {
      const stores = state.stores.filter(s => s.type !== 'd')
      return stores.sort((s1, s2) => s1.name > s2.name ? 1 : -1)
    })
  }, [state.stores])
  return (
    <IonPage>
      <Header title={labels.stores} />
      <IonContent fullscreen>
        <IonList className="ion-padding">
          {stores.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem> 
          : stores.map(s =>
              <IonItem key={s.id} routerLink={`/store-details/${s.id}`}>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{s.name}</IonText>
                  <IonText style={{color: colors[1].name}}>{userTypes.find(t => t.id === s.type)!.name}</IonText>
                </IonLabel>
                {!s.isActive && <IonBadge color="danger">{labels.inActive}</IonBadge>}
              </IonItem> 
            )
          }
        </IonList>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton routerLink="/add-store">
          <IonIcon ios={addOutline} />
        </IonFabButton>
      </IonFab>
    </IonPage>
  )
}

export default Stores
