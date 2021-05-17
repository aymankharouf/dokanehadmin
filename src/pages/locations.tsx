import {useContext, useState, useEffect} from 'react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import { IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, useIonToast } from '@ionic/react'
import Header from './header'
import { addOutline, trashOutline } from 'ionicons/icons'
import { deleteLocation, getMessage } from '../data/actions'
import { useLocation } from 'react-router'

const Locations = () => {
  const {state} = useContext(StateContext)
  const [message] = useIonToast()
  const location = useLocation()
  const [locations, setLocations] = useState(() => [...state.locations].sort((l1, l2) => l1.name > l2.name ? 1 : -1))
  useEffect(() => {
    setLocations(() => [...state.locations].sort((l1, l2) => l1.name > l2.name ? 1 : -1))
  }, [state.locations])
  const handleDelete = (locationId: string) => {
    alert({
      header: labels.confirmationTitle,
      message: labels.confirmationText,
      buttons: [
        {text: labels.cancel},
        {text: labels.ok, handler: async () => {
          try{
            const locationStores = state.stores.filter(s => s.locationId === locationId)
            const locationUsers = state.users.filter(u => u.locationId === locationId)
            if (locationStores.length + locationUsers.length > 0) throw new Error('locationInUse') 
            deleteLocation(locationId, state.locations)
            message(labels.deleteSuccess, 3000)
          } catch(err) {
            message(getMessage(location.pathname, err), 3000)
          }    
        }},
      ],
    })
  }

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
                <IonIcon 
                  ios={trashOutline} 
                  slot="end" 
                  style={{fontSize: '20px', marginRight: '10px'}} 
                  onClick={()=> handleDelete(l.id)}
                />
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
