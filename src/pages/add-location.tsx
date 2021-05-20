import {useState} from 'react'
import {addLocation, getMessage} from '../data/actions'
import labels from '../data/labels'
import { IonButton, IonContent, IonInput, IonItem, IonLabel, IonList, IonPage, useIonToast } from '@ionic/react'
import { useHistory, useLocation } from 'react-router'
import Header from './header'

const AddLocation = () => {
  const [name, setName] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const handleSubmit = () => {
    try{
      const location = {
        id: Math.random().toString(),
        name,
        position: {lat: +lat, lng: +lng}
      }
      addLocation(location)
      message(labels.addSuccess, 3000)
      history.goBack()
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return (
    <IonPage>
      <Header title={labels.addLocation} />
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
        {name && 
          <IonButton 
            expand="block" 
            fill="clear" 
            onClick={handleSubmit}
          >
            {labels.save}
          </IonButton>
        }
      </IonContent>
    </IonPage>
  )
}
export default AddLocation
