import {useContext} from 'react'
import moment from 'moment'
import 'moment/locale/ar'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import { IonContent, IonImg, IonItem, IonLabel, IonList, IonPage, IonText, IonThumbnail } from '@ionic/react'
import Header from './header'
import { colors } from '../data/config'
import { getStoreName } from '../data/actions'

const ProductRequests = () => {
  const {state} = useContext(StateContext)
  return(
    <IonPage>
      <Header title={labels.productRequests} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {state.productRequests.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem> 
          : state.productRequests.map(r =>
              <IonItem key={r.id} routerLink={`/product-request-details/${r.id}`}>
                <IonThumbnail slot="start">
                  <IonImg src={r.imageUrl} alt={labels.noImage} />
                </IonThumbnail>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{r.name}</IonText>
                  <IonText style={{color: colors[1].name}}>{r.weight}</IonText>
                  <IonText style={{color: colors[2].name}}>{r.country}</IonText>
                  <IonText style={{color: colors[3].name}}>{`${labels.store}: ${getStoreName(state.stores.find(s => s.id === r.storeId)!, state)}`}</IonText>
                  <IonText style={{color: colors[4].name}}>{moment(r.time).fromNow()}</IonText>
                </IonLabel>
                <IonLabel slot="end" className="price">{r.price!.toFixed(2)}</IonLabel>
              </IonItem> 
            )
          }
        </IonList>
      </IonContent>
    </IonPage>
  )
}

export default ProductRequests
