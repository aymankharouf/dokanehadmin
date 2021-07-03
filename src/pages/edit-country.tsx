import { useState, useContext, useRef, useEffect } from 'react'
import { StateContext } from '../data/state-provider'
import { deleteCountry, editCountry, getMessage } from '../data/actions'
import labels from '../data/labels'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonContent, IonFab, IonFabButton, IonFabList, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, useIonAlert, useIonToast } from '@ionic/react'
import Header from './header'
import { checkmarkOutline, chevronDownOutline, trashOutline } from 'ionicons/icons'

type Params = {
  id: string
}
const EditCountry = () => {
  const { state } = useContext(StateContext)
  const params = useParams<Params>()
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [alert] = useIonAlert()
  const [country] = useState(() => state.countries.find(c => c.id === params.id)!)
  const [name, setName] = useState(country.name)
  const [hasChanged, setHasChanged] = useState(false)
  const fabList = useRef<HTMLIonFabElement | null>(null)
  useEffect(() => {
    if (hasChanged && fabList.current) fabList.current!.close()
  }, [hasChanged])
  useEffect(() => {
    if (name !== country.name) setHasChanged(true)
    else setHasChanged(false)
  }, [country, name])

  const handleSubmit = () => {
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
      <IonContent fullscreen>
        <IonList className="ion-padding">
          <IonItem>
            <IonLabel position="floating" color="primary">
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
      <IonFab horizontal="end" vertical="top" slot="fixed" ref={fabList}>
        <IonFabButton>
          <IonIcon ios={chevronDownOutline}></IonIcon>
        </IonFabButton>
        <IonFabList>
          {name && hasChanged &&
            <IonFabButton color="success" onClick={handleSubmit}>
              <IonIcon ios={checkmarkOutline}></IonIcon>
            </IonFabButton>
          }
          {state.products.filter(p => p.countryId === params.id).length === 0 &&
            <IonFabButton color="danger" onClick={handleDelete}>
              <IonIcon ios={trashOutline}></IonIcon>
            </IonFabButton>
          }
        </IonFabList>
      </IonFab>
    </IonPage>
  )
}
export default EditCountry
