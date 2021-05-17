import {useState, useContext} from 'react'
import {editLocation, getMessage} from '../data/actions'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, useIonToast } from '@ionic/react'
import Header from './header'
import { checkmarkOutline } from 'ionicons/icons'

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
  const [name, setName] = useState(currentLocation?.name)
  const handleEdit = () => {
    try{
      const newLocation = {
        ...currentLocation,
        name,
      }
      editLocation(newLocation, state.locations)
      message(labels.editSuccess, 3000)
      history.goBack() 
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
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
        </IonList>
      </IonContent>
        {name && (name !== currentLocation.name) &&
          <IonFab vertical="top" horizontal="end" slot="fixed">
            <IonFabButton onClick={handleEdit}>
              <IonIcon ios={checkmarkOutline} />
            </IonFabButton>
          </IonFab>
        }
    </IonPage>
  )
}
export default EditLocation
