import {useState, useContext} from 'react'
import {StateContext} from '../data/state-provider'
import {deleteTrademark, editTrademark, getMessage} from '../data/actions'
import labels from '../data/labels'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonButton, IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, useIonToast } from '@ionic/react'
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
  const [trademark] = useState(() => state.trademarks.find(t => t.id === params.id)!)
  const [name, setName] = useState(trademark.name)
  const handleEdit = () => {
    try{
      const newTrademark = {
        ...trademark,
        name
      }
      editTrademark(newTrademark, state.trademarks)
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
            const trademarkProducts = state.products.filter(p => p.trademarkId === params.id)
            if (trademarkProducts.length > 0) throw new Error('trademarkProductsFound') 
            deleteTrademark(params.id, state.trademarks)
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
      <Header title={labels.editTrademark} />
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
          {name && (name !== trademark.name) && 
            <IonButton 
              expand="block" 
              fill="clear" 
              onClick={handleEdit}
            >
              {labels.save}
            </IonButton>
          }
        </IonList>
      </IonContent>
        {name && (name !== trademark.name) &&
          <IonFab vertical="top" horizontal="end" slot="fixed">
            <IonFabButton onClick={handleDelete} color="danger">
              <IonIcon ios={trashOutline} />
            </IonFabButton>
          </IonFab>
        }
    </IonPage>
  )
}
export default EditCountry
