import {useState, useContext} from 'react'
import {StateContext} from '../data/state-provider'
import {editCountry, getMessage} from '../data/actions'
import labels from '../data/labels'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, useIonToast } from '@ionic/react'
import Header from './header'
import { checkmarkOutline } from 'ionicons/icons'

type Params = {
  id: string
}
const EditCountry = () => {
  const {state} = useContext(StateContext)
  const params = useParams<Params>()
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [country] = useState(() => state.countries.find(c => c.id === params.id)!)
  const [name, setName] = useState(country.name)
  const handleEdit = () => {
    try{
      const newCountry = {
        ...country,
        name,
      }
      editCountry(newCountry, state.countries)
      message(labels.editSuccess, 3000)
      history.goBack()
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return (
    <IonPage>
      <Header title={labels.editCountry} />
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
        {name && (name !== country.name) &&
          <IonFab vertical="top" horizontal="end" slot="fixed">
            <IonFabButton onClick={handleEdit}>
              <IonIcon ios={checkmarkOutline} />
            </IonFabButton>
          </IonFab>
        }
    </IonPage>
  )
}
export default EditCountry
