import {useContext, useState, useEffect} from 'react'
import moment from 'moment'
import 'moment/locale/ar'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import {ProductRequest} from '../data/types'
import { IonContent, IonItem, IonLabel, IonList, IonPage, IonText } from '@ionic/react'
import Header from './header'
import { randomColors } from '../data/config'

const ProductRequests = () => {
  const {state} = useContext(StateContext)
  const [productRequests, setProductRequests] = useState<ProductRequest[]>([])
  useEffect(() => {
    setProductRequests(() => [...state.productRequests].sort((r1, r2) => r1.time > r2.time ? -1 : 1))
  }, [state.productRequests])
  return(
    <IonPage>
      <Header title={labels.productRequests} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {productRequests.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem> 
          : productRequests.map(r =>
              <IonItem key={r.id} routerLink={`/product-request-details/${r.id}`}>
                <IonLabel>
                  <IonText color={randomColors[0].name}>{r.name}</IonText>
                  <IonText color={randomColors[1].name}>{r.weight}</IonText>
                  <IonText color={randomColors[2].name}>{r.country}</IonText>
                  <IonText color={randomColors[3].name}>{moment(r.time).fromNow()}</IonText>
                </IonLabel>
              </IonItem> 
            )
          }
        </IonList>
      </IonContent>
    </IonPage>
  )
}

export default ProductRequests
