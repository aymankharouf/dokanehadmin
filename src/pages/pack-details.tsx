import {useContext, useState, useEffect} from 'react'
import {StateContext} from '../data/state-provider'
import {deleteStorePack, deletePack, getMessage, getStoreName} from '../data/actions'
import labels from '../data/labels'
import {Pack, PackStore, Store} from '../data/types'
import {randomColors, units} from '../data/config'
import moment from 'moment'
import 'moment/locale/ar'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonBackdrop, IonCard, IonCol, IonContent, IonFab, IonFabButton, IonFabList, IonGrid, IonIcon, IonImg, IonItem, IonLabel, IonList, IonPage, IonRow, IonText, useIonAlert, useIonToast } from '@ionic/react'
import Header from './header'
import { addOutline, chevronDownOutline, pencilOutline, trashOutline } from 'ionicons/icons'

type Params = {
  id: string
}
type ExtendedPackStore = PackStore & {
  packInfo: Pack,
  storeInfo: Store,
}
const PackDetails = () => {
  const {state} = useContext(StateContext)
  const params = useParams<Params>()
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [alert] = useIonAlert()
  const [pack] = useState(() => state.packs.find(p => p.id === params.id))
  const [packStores, setPackStores] = useState<ExtendedPackStore[]>([])
  const [showBackDrop, setShowBackDrop] = useState(false)
  useEffect(() => {
    setPackStores(() => {
      const packStores = state.packStores.filter(p => p.packId === pack?.id || state.packs.find(pa => pa.id === p.packId && pa.subPackId === pack?.id))
      const results = packStores.map(s => {
        const storeInfo = state.stores.find(st => st.id === s.storeId)!
        const packInfo = state.packs.find(p => p.id === s.packId)!
        return {
          ...s,
          storeInfo,
          packInfo,
        }
      })
      return results.sort((s1, s2) => s1.price - s2.price)
    })
  }, [pack, state.stores, state.packStores, state.packs, state.regions])
  const handleDeletePrice = (storePackInfo: PackStore) => {
    alert({
      header: labels.confirmationTitle,
      message: labels.confirmationText,
      buttons: [
        {text: labels.cancel},
        {text: labels.ok, handler: () => {
          try{
            deleteStorePack(storePackInfo, state.packStores, state.packs)
            message(labels.deleteSuccess, 3000)
          } catch(err) {
            message(getMessage(location.pathname, err), 3000)
          }    
        }},
      ],
    })
  }
  const handleDelete = () => {
    alert({
      header: labels.confirmationTitle,
      message: labels.confirmationText,
      buttons: [
        {text: labels.cancel},
        {text: labels.ok, handler: () => {
          try{
            deletePack(pack?.id!)
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
      <Header title={`${pack?.product.name}${pack?.product.alias ? '-' + pack.product.alias : ''}`} />
      <IonContent fullscreen>
        <IonBackdrop visible={showBackDrop}/>
        <IonCard>
          <IonGrid>
            <IonRow>
              <IonCol>
                {pack?.name}
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <IonImg src={pack?.imageUrl || pack?.product.imageUrl} alt={labels.noImage} />
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>{`${pack?.unitsCount} ${units.find(u => u.id === pack?.product.unit)?.name}`}</IonCol>
              <IonCol className="ion-text-end">{moment(pack?.lastTrans).fromNow()}</IonCol>
            </IonRow>
          </IonGrid>
        </IonCard>
        <IonList>
          {packStores.map((s, i) => 
            <IonItem key={i}>
              <IonLabel>
                <IonText color={randomColors[0].name}>{getStoreName(s.storeInfo, state.regions)}</IonText>
                <IonText color={randomColors[1].name}>{s.packId === pack?.id ? '' : `${s.packInfo?.product.name}${s.packInfo?.product.alias ? '-' + s.packInfo.product.alias : ''}`}</IonText>
                <IonText color={randomColors[2].name}>{s.packId === pack?.id ? '' : s.packInfo?.name}</IonText>
                <IonText color={randomColors[3].name}>{`${labels.price}: ${s.price.toFixed(2)} ${s.isActive ? '' : '(' + labels.inActive + ')'}`}</IonText>
                <IonText color={randomColors[4].name}>{s.packInfo.subCount ? `${labels.count}: ${s.packInfo.subCount}` : ''}</IonText>
              </IonLabel>
              {s.packId === pack?.id && 
                <IonIcon 
                  ios={trashOutline} 
                  slot="end" 
                  color="danger"
                  style={{fontSize: '20px', marginRight: '10px'}} 
                  onClick={()=> handleDeletePrice(s)}
                />     
              }       
            </IonItem>
          )}
        </IonList>
      </IonContent>
      <IonFab horizontal="end" vertical="top" slot="fixed">
        <IonFabButton onClick={() => setShowBackDrop(s => !s)}>
          <IonIcon ios={chevronDownOutline}></IonIcon>
        </IonFabButton>
        <IonFabList onClick={() => setShowBackDrop(false)}>
          <IonFabButton color="success" routerLink={`/add-pack-store/${params.id}`}>
            <IonIcon ios={addOutline}></IonIcon>
          </IonFabButton>
          <IonFabButton color="warning" routerLink={`/${pack?.subPackId ? 'edit-group' : 'edit-pack'}/${params.id}`}>
            <IonIcon ios={pencilOutline}></IonIcon>
          </IonFabButton>
          {state.packStores.filter(p => p.packId === pack?.id).length === 0 &&
            <IonFabButton color="danger" onClick={handleDelete}>
              <IonIcon ios={trashOutline}></IonIcon>
            </IonFabButton>
          }
        </IonFabList>
      </IonFab>
    </IonPage>
  )
}

export default PackDetails
