import {useContext, useState, useEffect} from 'react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import {colors} from '../data/config'
import {getCategoryName, productOfText} from '../data/actions'
import {Pack} from '../data/types'
import { IonContent, IonItem, IonLabel, IonList, IonPage, IonText, IonThumbnail } from '@ionic/react'
import Header from './header'
import { useParams } from 'react-router'

type Params = {
  id: string
}
type ExtendedPack = Pack & {
  categoryName: string,
  countryName: string,
  trademarkName?: string,
}
const Packs = () => {
  const {state} = useContext(StateContext)
  const params = useParams<Params>()
  const [store] = useState(() => state.stores.find(s => s.id === params.id)!)
  const [packs, setPacks] = useState<ExtendedPack[]>([])
  useEffect(() => {
    setPacks(() => {
      const packs = state.packs.filter(p => params.id === '0' ? p.isActive && !state.packStores.find(s => s.packId === p.id) : state.packStores.find(s => s.packId === p.id && s.storeId === params.id))
      return packs.map(p => {
        const categoryInfo = state.categories.find(c => c.id === p.product.categoryId)!
        const trademarkName = state.trademarks.find(t => t.id === p.product.trademarkId)?.name
        const countryName = state.countries.find(c => c.id === p.product.countryId)!.name
        return {
          ...p,
          categoryName: getCategoryName(categoryInfo, state.categories),
          trademarkName,
          countryName,
          price: params.id === '0' ? 0 : state.packStores.find(s => s.storeId === params.id && s.packId === p.id)?.price
        }
      })
    })
  }, [state.packs, state.categories, state.trademarks, state.countries, state.packStores, state.storeRequests, params])
  return(
    <IonPage>
      <Header title={params.id === '0' ? labels.notUsedPacks : `${labels.storePacks}-${store.name}`}/>
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {packs.length === 0 ?
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : packs.map(p => 
              <IonItem key={p.id} routerLink={`/pack-details/${p.id}`}>
                <IonThumbnail slot="start">
                  <img src={p.imageUrl || p.product.imageUrl} alt={labels.noImage} />
                </IonThumbnail>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{p.product.name}</IonText>
                  <IonText style={{color: colors[1].name}}>{p.product.alias}</IonText>
                  <IonText style={{color: colors[2].name}}>{p.name}</IonText>
                  <IonText style={{color: colors[3].name}}>{p.categoryName}</IonText>
                  <IonText style={{color: colors[4].name}}>{productOfText(p.countryName, p.trademarkName)}</IonText>
                </IonLabel>
                <IonLabel slot="end" className="price">{p.price ? p.price!.toFixed(2): ''}</IonLabel>
              </IonItem>    
            )
          }
        </IonList>
      </IonContent>
    </IonPage>
  )
}

export default Packs