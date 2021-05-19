import {useContext, useState} from 'react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import {getMessage, rejectPackRequest} from '../data/actions'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonActionSheet, IonCard, IonContent, IonFab, IonFabButton, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonList, IonPage, useIonAlert, useIonLoading, useIonToast } from '@ionic/react'
import Header from './header'
import { settingsOutline } from 'ionicons/icons'

type Params = {
  id: string
}
const PackRequestDetails = () => {
  const {state} = useContext(StateContext)
  const params = useParams<Params>()
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [loading, dismiss] = useIonLoading()
  const [alert] = useIonAlert()
  const [packRequest] = useState(() => state.packRequests.find(p => p.id === params.id))
  const [siblingPack] = useState(() => state.packs.find(p => p.id === packRequest?.siblingPackId))
  const [actionOpened, setActionOpened] = useState(false);
  const handleRejection = () => {
    alert({
      header: labels.confirmationTitle,
      message: labels.confirmationText,
      buttons: [
        {text: labels.cancel},
        {text: labels.ok, handler: async () => {
          try{
            loading()
            await rejectPackRequest(packRequest!, state.packRequests, state.users)
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
              value={state.stores.find(s => s.id === packRequest?.storeId)?.name} 
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
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton onClick={() => setActionOpened(true)}>
          <IonIcon ios={settingsOutline} />
        </IonFabButton>
      </IonFab>
      <IonActionSheet
          isOpen={actionOpened}
          onDidDismiss={() => setActionOpened(false)}
          buttons={[
            {
              text: labels.packs,
              cssClass: 'primary',
              handler: () => history.push(`/product-packs/${siblingPack?.product.id}/n`)
            },
            {
              text: labels.addPack,
              cssClass: 'secondary',
              handler: () => history.push(`/add-${packRequest?.subCount ? 'group' : 'pack'}/${siblingPack?.product.id}/${params.id}`)
            },
            {
              text: labels.activatePack,
              cssClass: 'success',
              handler: () => history.push(`/add-store-pack/${packRequest?.storeId}/${params.id}`)
            },
            {
              text: labels.rejection,
              cssClass: 'danger',
              handler: () => handleRejection()
            },

          ]}
        />
    </IonPage>
  )
}
export default PackRequestDetails
