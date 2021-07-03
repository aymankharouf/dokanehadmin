import { useContext, useState, useEffect } from 'react'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage } from '@ionic/react'
import Header from './header'
import { addOutline } from 'ionicons/icons'


const Countries = () => {
  const { state } = useContext(StateContext)
  const [countries, setCountries] = useState(() => [...state.countries].sort((c1, c2) => c1.name > c2.name ? 1 : -1))
  useEffect(() => {
    setCountries(() => [...state.countries].sort((c1, c2) => c1.name > c2.name ? 1 : -1))
  }, [state.countries])
  return (
    <IonPage>
      <Header title={labels.countries} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {countries.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : countries.map(c =>
              <IonItem key={c.id} routerLink={`/edit-country/${c.id}`}>
                <IonLabel>{c.name}</IonLabel>
              </IonItem>  
            )
          }
        </IonList>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton routerLink="/add-country">
          <IonIcon ios={addOutline} />
        </IonFabButton>
      </IonFab>
    </IonPage>
  )
}

export default Countries
