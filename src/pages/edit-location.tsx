import {useState, useContext} from 'react'
import {deleteLocation, editLocation, getMessage} from '../data/actions'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonButton, IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, useIonToast } from '@ionic/react'
import Header from './header'
import { trashOutline } from 'ionicons/icons'

type Params = {
  id: string
}
const EditLocation = () => {
  const {state} = useContext(StateContext)
  const params = useParams<Params>()
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [currentLocation] = useState(() => state.locations.find(l => l.id === params.id)!)
  const [name, setName] = useState(currentLocation.name)
  const [lat, setLat] = useState(currentLocation.position.lat.toString())
  const [lng, setLng] = useState(currentLocation.position.lng.toString())
  const handleEdit = () => {
    try{
      const newLocation = {
        ...currentLocation,
        name,
        position: {lat: +lat, lng: +lng}
      }
      editLocation(newLocation, state.locations)
      message(labels.editSuccess, 3000)
      history.goBack() 
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }
  const handleDelete = () => {
    alert({
      header: labels.confirmationTitle,
      message: labels.confirmationText,
      buttons: [
        {text: labels.cancel},
        {text: labels.ok, handler: async () => {
          try{
            const locationStores = state.stores.filter(s => s.locationId === params.id)
            const locationUsers = state.users.filter(u => u.locationId === params.id)
            if (locationStores.length + locationUsers.length > 0) throw new Error('locationInUse') 
            deleteLocation(params.id, state.locations)
            message(labels.deleteSuccess, 3000)
            history.goBack()
          } catch(err) {
            message(getMessage(location.pathname, err), 3000)
          }    
        }},
      ],
    })
  }
  return (
    <IonPage>
      <Header title={labels.editLocation} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel position="floating">
              {labels.name}
            </IonLabel>
            <IonInput 
              value={name} 
              type="text" 
              autofocus
              clearInput
              onIonChange={e => setName(e.detail.value!)} 
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">
              {labels.latitude}
            </IonLabel>
            <IonInput 
              value={lat} 
              type="number" 
              clearInput
              onIonChange={e => setLat(e.detail.value!)} 
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">
              {labels.longitude}
            </IonLabel>
            <IonInput 
              value={lng} 
              type="number" 
              clearInput
              onIonChange={e => setLng(e.detail.value!)} 
            />
          </IonItem>
        </IonList>
        {name && (name !== currentLocation.name || +lat !== currentLocation.position.lat || +lng !== currentLocation.position.lng) && 
          <IonButton 
            expand="block" 
            fill="clear" 
            onClick={handleEdit}
          >
            {labels.save}
          </IonButton>
        }
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton onClick={handleDelete} color="danger">
          <IonIcon ios={trashOutline} />
        </IonFabButton>
      </IonFab>
    </IonPage>
  )
}
export default EditLocation
