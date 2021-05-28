import {useContext, useState, useEffect} from 'react'
import {StateContext} from '../data/state-provider'
import moment from 'moment'
import 'moment/locale/ar'
import labels from '../data/labels'
import {Category, Pack, PackStore} from '../data/types'
import { useParams } from 'react-router'
import { IonContent, IonImg, IonItem, IonLabel, IonList, IonPage, IonText, IonThumbnail } from '@ionic/react'
import Header from './header'
import { randomColors } from '../data/config'

type Params = {
  id: string
}
type ExtendedPackStore = PackStore & {
  packInfo: Pack,
  categoryInfo: Category
}
const StorePacks = () => {
  const {state} = useContext(StateContext)
  const params = useParams<Params>()
  const [store] = useState(() => state.stores.find(s => s.id === params.id)!)
  const [storePacks, setStorePacks] = useState<ExtendedPackStore[]>([])
  useEffect(() => {
    setStorePacks(() => {
      const storePacks = state.packStores.filter(p => p.storeId === params.id)
      const results = storePacks.map(p => {
        const packInfo = state.packs.find(pa => pa.id === p.packId)!
        const categoryInfo = state.categories.find(c => c.id === packInfo.product.categoryId)!
        return {
          ...p,
          packInfo,
          categoryInfo
        } 
      })
      return results.sort((p1, p2) => p1.packInfo.product.categoryId === p2.packInfo.product.categoryId ? (p2.time > p1.time ? -1 : 1) : (p1.categoryInfo.name > p2.categoryInfo.name ? 1 : -1))
    })
  }, [state.packStores, state.packs, state.categories, params.id])

  return(
    <IonPage>
      <Header title={store.name} withSearch/>
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {storePacks.length === 0 ?
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : storePacks.map((p, i) => 
              <IonItem key={i} routerLink={`/pack-details/${p.packId}`}>
                <IonThumbnail slot="start">
                  <IonImg src={p.packInfo.imageUrl || p.packInfo.product.imageUrl} alt={labels.noImage} />
                </IonThumbnail>
                <IonLabel>
                  <IonText color={randomColors[0].name}>{p.packInfo.product.name}</IonText>
                  <IonText color={randomColors[1].name}>{p.packInfo.product.alias}</IonText>
                  <IonText color={randomColors[2].name}>{p.packInfo.name}</IonText>
                  <IonText color={randomColors[3].name}>{`${labels.price}: ${p.price.toFixed(2)}`}</IonText>
                  <IonText color={randomColors[4].name}>{p.categoryInfo.name}</IonText>
                  <IonText color={randomColors[5].name}>{moment(p.time).fromNow()}</IonText>
                </IonLabel>
              </IonItem>    
            )
          }
        </IonList>
      </IonContent>
    </IonPage>
  )
}

export default StorePacks
