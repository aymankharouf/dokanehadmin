import {useContext, useState, useEffect} from 'react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import { IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, useIonAlert, useIonToast } from '@ionic/react'
import Header from './header'
import { addOutline, trashOutline } from 'ionicons/icons'
import { deleteCountry, getMessage } from '../data/actions'
import { useLocation } from 'react-router'


const Countries = () => {
  const {state} = useContext(StateContext)
  const location = useLocation()
  const [message] = useIonToast()
  const [alert] = useIonAlert();
  const [countries, setCountries] = useState(() => [...state.countries].sort((c1, c2) => c1.name > c2.name ? 1 : -1))
  useEffect(() => {
    setCountries(() => [...state.countries].sort((c1, c2) => c1.name > c2.name ? 1 : -1))
  }, [state.countries])
  const handleDelete = (countryId: string) => {
    alert({
      header: labels.confirmationTitle,
      message: labels.confirmationText,
      buttons: [
        {text: labels.cancel},
        {text: labels.ok, handler: async () => {
          try{
            const countryProducts = state.products.filter(p => p.countryId === countryId)
            if (countryProducts.length > 0) throw new Error('countryProductsFound') 
            deleteCountry(countryId, state.countries)
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
                <IonIcon 
                  ios={trashOutline} 
                  slot="end" 
                  style={{fontSize: '20px', marginRight: '10px'}} 
                  onClick={()=> handleDelete(c.id)}
                />
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
