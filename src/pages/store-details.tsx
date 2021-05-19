import {useContext, useState, useEffect} from 'react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import { storeTypes } from '../data/config'
import { useParams } from 'react-router'
import { IonContent, IonFab, IonFabButton, IonFabList, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonToggle } from '@ionic/react'
import Header from './header'
import { cartOutline, chevronDownOutline, pencilOutline } from 'ionicons/icons'

type Params = {
  id: string
}
const StoreDetails = () => {
  const {state} = useContext(StateContext)
  const params = useParams<Params>()
  const [store, setStore] = useState(() => state.stores.find(s => s.id === params.id)!)
  useEffect(() => {
    setStore(() => state.stores.find(s => s.id === params.id)!)
  }, [state.stores, params.id])

  return (
    <IonPage>
      <Header title={labels.storeDetails} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.name}
            </IonLabel>
            <IonInput 
              value={store.name} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.mobile}
            </IonLabel>
            <IonInput 
              value={store.mobile} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel color="primary">{labels.isActive}</IonLabel>
            <IonToggle checked={store.isActive} disabled/>
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.type}
            </IonLabel>
            <IonInput 
              value={storeTypes.find(t => t.id === store.type)!.name} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.location}
            </IonLabel>
            <IonInput 
              value={state.locations.find(l => l.id === store.locationId)?.name || ''} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.address}
            </IonLabel>
            <IonInput 
              value={store.address} 
              readonly
            />
          </IonItem>
        </IonList>
      </IonContent>
      <IonFab horizontal="end" vertical="top" slot="fixed">
        <IonFabButton>
          <IonIcon ios={chevronDownOutline}></IonIcon>
        </IonFabButton>
        <IonFabList>
          <IonFabButton color="success" routerLink={`/store-packs/${params.id}`}>
            <IonIcon ios={cartOutline}></IonIcon>
          </IonFabButton>
          <IonFabButton color="warning" routerLink={`/edit-store/${params.id}`}>
            <IonIcon ios={pencilOutline}></IonIcon>
          </IonFabButton>
        </IonFabList>
      </IonFab>
    </IonPage>
  )
}
export default StoreDetails
