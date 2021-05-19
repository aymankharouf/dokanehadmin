import {useContext, useState, useEffect} from 'react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import { useParams } from 'react-router'
import { IonCard, IonCol, IonContent, IonFab, IonFabButton, IonGrid, IonIcon, IonImg, IonPage, IonRow } from '@ionic/react'
import Header from './header'
import { pencilOutline } from 'ionicons/icons'

type Params = {
  id: string
}
const AdvertDetails = () => {
  const {state} = useContext(StateContext)
  const params = useParams<Params>()
  const [advert, setAdvert] = useState(() => state.adverts.find(a => a.id === params.id))
  useEffect(() => {
    setAdvert(() => state.adverts.find(a => a.id === params.id))
  }, [state.adverts, params.id])
  return (
    <IonPage>
      <Header title={labels.advertDetails} />
      <IonContent fullscreen>
        <IonCard>
          <IonGrid>
            <IonRow>
              <IonCol>
                <IonImg src={advert?.imageUrl} alt={advert?.title} />
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>{advert?.text}</IonCol>
            </IonRow>
          </IonGrid>
        </IonCard>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton routerLink={`/edit-advert/${params.id}`}>
          <IonIcon ios={pencilOutline} />
        </IonFabButton>
      </IonFab>
    </IonPage>
  )
}

export default AdvertDetails
