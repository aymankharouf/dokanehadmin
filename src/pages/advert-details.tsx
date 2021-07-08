import { useContext, useState, useEffect } from 'react'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonCard, IonCol, IonContent, IonFab, IonFabButton, IonFabList, IonGrid, IonIcon, IonImg, IonPage, IonRow, useIonAlert, useIonToast } from '@ionic/react'
import Header from './header'
import { chevronDownOutline, pencilOutline, trashOutline } from 'ionicons/icons'
import { deleteAdvert, getMessage } from '../data/actions'

type Params = {
  id: string
}
const AdvertDetails = () => {
  const { state } = useContext(StateContext)
  const params = useParams<Params>()
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [alert] = useIonAlert()
  const [advert, setAdvert] = useState(() => state.adverts.find(a => a.id === params.id))
  useEffect(() => {
    setAdvert(() => state.adverts.find(a => a.id === params.id))
  }, [state.adverts, params.id])
  const handleDelete = () => {
    alert({
      header: labels.confirmationTitle,
      message: labels.confirmationText,
      buttons: [
        {text: labels.cancel},
        {text: labels.ok, handler: () => {
          try{
            deleteAdvert(advert!)
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
      <Header title={labels.advertDetails} />
      <IonContent fullscreen>
        <IonCard>
          <IonGrid>
            <IonRow>
              <IonCol className="card-title">{advert?.title}</IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                {advert?.imageUrl && <IonImg src={advert?.imageUrl} alt={advert?.title} />}
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol className="ion-text-center">{advert?.text}</IonCol>
            </IonRow>
          </IonGrid>
        </IonCard>
      </IonContent>
      <IonFab horizontal="end" vertical="top" slot="fixed">
        <IonFabButton>
          <IonIcon ios={chevronDownOutline} />
        </IonFabButton>
        <IonFabList>
          <IonFabButton color="success" routerLink={`/edit-advert/${params.id}`}>
            <IonIcon ios={pencilOutline} />
          </IonFabButton>
          <IonFabButton color="danger" onClick={handleDelete}>
            <IonIcon ios={trashOutline} />
          </IonFabButton>
        </IonFabList>
      </IonFab>
    </IonPage>
  )
}

export default AdvertDetails
