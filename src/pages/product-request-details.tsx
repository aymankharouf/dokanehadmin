import {useContext, useState, useEffect} from 'react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import {rejectProductRequest, getMessage} from '../data/actions'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonCard, IonContent, IonFab, IonFabButton, IonFabList, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonList, IonPage, useIonAlert, useIonLoading, useIonToast } from '@ionic/react'
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
  const [loading, dismiss] = useIonLoading()
  const [productRequest, setProductRequest] = useState(() => state.productRequests.find(p => p.id === params.id))
  useEffect(() => {
    setProductRequest(() => state.productRequests.find(p => p.id === params.id))
  }, [state.productRequests, params.id])
  const handleRejection = () => {
    alert({
      header: labels.confirmationTitle,
      message: labels.confirmationText,
      buttons: [
        {text: labels.cancel},
        {text: labels.ok, handler: async () => {
          try{
            loading()
            await rejectProductRequest(productRequest!, state.productRequests, state.users)
            dismiss()
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
      <Header title={productRequest?.name} />
      <IonContent fullscreen>
        <IonCard>
          <IonImg src={productRequest?.imageUrl} alt={labels.noImage} />
        </IonCard>
        <IonList>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.storeName}
            </IonLabel>
            <IonInput 
              value={state.stores.find(s => s.id === productRequest?.storeId)?.name} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.weight}
            </IonLabel>
            <IonInput 
              value={productRequest?.weight} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.country}
            </IonLabel>
            <IonInput 
              value={productRequest?.country} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.price}
            </IonLabel>
            <IonInput 
              value={productRequest?.price.toFixed(2)} 
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
          <IonFabButton color="success" routerLink={`/add-product/${params.id}`}>
            <IonIcon ios={checkmarkOutline}></IonIcon>
          </IonFabButton>
          <IonFabButton color="danger" onClick={handleRejection}>
            <IonIcon ios={trashOutline}></IonIcon>
          </IonFabButton>
        </IonFabList>
      </IonFab>
    </IonPage>
  )
}
export default ProductRequestDetails
