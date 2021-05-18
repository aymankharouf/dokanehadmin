import {useState} from 'react'
import {addLocation, getMessage} from '../data/actions'
import labels from '../data/labels'
import { IonButton, IonContent, IonInput, IonItem, IonLabel, IonList, IonPage, useIonToast } from '@ionic/react'
import { useHistory, useLocation } from 'react-router'
import Header from './header'

const AddLocation = () => {
  const [name, setName] = useState('')
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const handleSubmit = () => {
    try{
      addLocation({
        id: Math.random().toString(),
        name,
      })
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
