import {useContext, useState} from 'react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import {getMessage, getStoreName, resolvePackRequest} from '../data/actions'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonBackdrop, IonCard, IonContent, IonFab, IonFabButton, IonFabList, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonList, IonPage, useIonAlert, useIonToast } from '@ionic/react'
import Header from './header'
import { checkmarkOutline, chevronDownOutline, trashOutline } from 'ionicons/icons'

type Params = {
  id: string
}
const PackRequestDetails = () => {
  const {state} = useContext(StateContext)
  const params = useParams<Params>()
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [alert] = useIonAlert()
  const [packRequest] = useState(() => state.packRequests.find(p => p.id === params.id))
  const [siblingPack] = useState(() => state.packs.find(p => p.id === packRequest?.siblingPackId))
  const [storeInfo] = useState(() => state.stores.find(s => s.id === packRequest?.storeId)!)
  const handleAccept = async () => {
    try{
      await resolvePackRequest('a', packRequest!, state.packRequests, state.users)
      message(labels.approveSuccess, 3000)
      history.goBack()
    } catch(err) {
      message(getMessage(location.pathname, err), 3000)
    }    
  }
  const handleReject = () => {
    alert({
      header: labels.confirmationTitle,
      message: labels.confirmationText,
      buttons: [
        {text: labels.cancel},
        {text: labels.ok, handler: async () => {
          try{
            await resolvePackRequest('r', packRequest!, state.packRequests, state.users)
            message(labels.rejectSuccess, 3000)
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
      <Header title={packRequest?.name} />
      <IonContent fullscreen>
        <IonCard>
          <IonImg src={packRequest?.imageUrl || siblingPack?.product.imageUrl} alt={labels.noImage} />
        </IonCard>
        <IonList>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.storeName}
            </IonLabel>
            <IonInput 
              value={getStoreName(storeInfo, state.regions)} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.product}
            </IonLabel>
            <IonInput 
              value={siblingPack?.product.name} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.price}
            </IonLabel>
            <IonInput 
              value={packRequest?.price.toFixed(2)} 
              readonly
            />
          </IonItem>
        </IonList>
      </IonContent>
      <IonFab horizontal="end" vertical="top" slot="fixed">
        <IonFabButton>
          <IonIcon ios={chevronDownOutline}></IonIcon>
        </IonFabButton>
        <IonFabList>
          <IonFabButton color="success" onClick={handleAccept}>
            <IonIcon ios={checkmarkOutline}></IonIcon>
          </IonFabButton>
          <IonFabButton color="danger" onClick={handleReject}>
            <IonIcon ios={trashOutline}></IonIcon>
          </IonFabButton>
        </IonFabList>
      </IonFab>
    </IonPage>
  )
}
export default PackRequestDetails
