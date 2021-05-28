import {useContext, useState, useEffect} from 'react'
import moment from 'moment'
import 'moment/locale/ar'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import {PackRequest, Store} from '../data/types'
import { IonContent, IonImg, IonItem, IonLabel, IonList, IonPage, IonText, IonThumbnail } from '@ionic/react'
import Header from './header'
import { randomColors } from '../data/config'
import { getStoreName } from '../data/actions'

type ExtendedPackRequest = PackRequest & {
  storeInfo: Store
}
const PackRequests = () => {
  const {state} = useContext(StateContext)
  const [packRequests, setPackRequests] = useState<ExtendedPackRequest[]>([])
  useEffect(() => {
    setPackRequests(() => {
      const result = state.packRequests.map(r => {
        const storeInfo = state.stores.find(s => s.id === r.storeId)!
        return {
          ...r,
          storeInfo
        }
      })
      return result.sort((r1, r2) => r1.time > r2.time ? -1 : 1)
    })
  }, [state.packRequests, state.stores])
  return(
    <IonPage>
      <Header title={labels.packRequests} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {packRequests.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem> 
          : packRequests.map(r =>
              <IonItem key={r.id} routerLink={`/pack-request-details/${r.id}`}>
                <IonThumbnail slot="start">
                  <IonImg src={r.imageUrl || state.packs.find(p => p.id === r.siblingPackId)?.product.imageUrl} alt={labels.noImage} />
                </IonThumbnail>
                <IonLabel>
                  <IonText color={randomColors[0].name}>{state.packs.find(p => p.id === r.siblingPackId)?.product.name}</IonText>
                  <IonText color={randomColors[1].name}>{r.name}</IonText>
                  <IonText color={randomColors[2].name}>{`${labels.store}: ${getStoreName(r.storeInfo, state.regions)}`}</IonText>
                  <IonText color={randomColors[3].name}>{moment(r.time).fromNow()}</IonText>
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

export default PackRequests
