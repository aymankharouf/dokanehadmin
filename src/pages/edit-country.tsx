import {useState, useContext} from 'react'
import {StateContext} from '../data/state-provider'
import {deleteCountry, editCountry, getMessage} from '../data/actions'
import labels from '../data/labels'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonButton, IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, useIonAlert, useIonToast } from '@ionic/react'
import Header from './header'
import { trashOutline } from 'ionicons/icons'

type Params = {
  id: string
}
const EditCountry = () => {
  const {state} = useContext(StateContext)
  const params = useParams<Params>()
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [alert] = useIonAlert()
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
  const handleDelete = () => {
    alert({
      header: labels.confirmationTitle,
      message: labels.confirmationText,
      buttons: [
        {text: labels.cancel},
        {text: labels.ok, handler: async () => {
          try{
            const countryProducts = state.products.filter(p => p.countryId === params.id)
            if (countryProducts.length > 0) throw new Error('countryProductsFound') 
            deleteCountry(params.id, state.countries)
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
        {name && (name !== country.name) && 
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
export default EditCountry
