import {useContext, useState} from 'react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import {resolveProductRequest, getMessage, getStoreName} from '../data/actions'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonCard, IonContent, IonFab, IonFabButton, IonFabList, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonList, IonPage, useIonAlert, useIonToast } from '@ionic/react'
import Header from './header'
import { checkmarkOutline, chevronDownOutline, trashOutline } from 'ionicons/icons'

type Params = {
  id: string
}
const ProductRequestDetails = () => {
  const {state} = useContext(StateContext)
  const params = useParams<Params>()
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [alert] = useIonAlert()
  const [productRequest] = useState(() => state.productRequests.find(p => p.id === params.id)!)
  const handleAccept = async () => {
    try{
      await resolveProductRequest('a', productRequest, state.productRequests, state.users)
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
            await resolveProductRequest('r', productRequest, state.productRequests, state.users)
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
      <Header title={productRequest.name} />
      <IonContent fullscreen>
        <IonCard>
          <IonImg src={productRequest.imageUrl} alt={labels.noImage} />
        </IonCard>
        <IonList>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.storeName}
            </IonLabel>
            <IonInput 
              value={getStoreName(state.stores.find(s => s.id === productRequest.storeId)!, state.regions)} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.weight}
            </IonLabel>
            <IonInput 
              value={productRequest.weight} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.country}
            </IonLabel>
            <IonInput 
              value={productRequest.country} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.price}
            </IonLabel>
            <IonInput 
              value={productRequest.price.toFixed(2)} 
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
export default ProductRequestDetails
