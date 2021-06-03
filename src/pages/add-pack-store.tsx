import {useState, useContext} from 'react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import {addPackStore, getMessage, getStoreName} from '../data/actions'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonSelect, IonSelectOption, useIonToast } from '@ionic/react'
import Header from './header'
import { checkmarkOutline } from 'ionicons/icons'

type Params = {
  id: string
}
const AddPackStore = () => {
  const {state} = useContext(StateContext)
  const params = useParams<Params>()
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [price, setPrice] = useState('')
  const [storeId, setStoreId] = useState('')
  const [pack] = useState(() => state.packs.find(p => p.id === params.id)!)
  const [stores] = useState(() => state.stores.filter(s => (pack.forSale && s.type !== 'r') || ['d', 'w'].includes(s.type)))
  const handleSubmit = () => {
    try{
      if (state.packStores.find(p => p.packId === pack.id && p.storeId === storeId)) {
        throw new Error('duplicatePackInStore')
      }
      if (+price <= 0 || +price !== Number((+price).toFixed(2))) {
        throw new Error('invalidPrice')
      }
      const storePack = {
        packId: pack.id!,
        storeId,
        price: +price,
        isRetail: state.stores.find(s => s.id === storeId)!.type === 's',
        isActive: true,
        time: new Date()
      }
      addPackStore(storePack, state.packs)
      message(labels.addSuccess, 3000)
      history.goBack()
    } catch(err) {
    	message(getMessage(location.pathname, err), 3000)
    }
  }

  return (
    <IonPage>
      <Header title={labels.addPrice} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel position="floating" color="primary">{labels.store}</IonLabel>
            <IonSelect 
              ok-text={labels.ok} 
              cancel-text={labels.cancel} 
              value={storeId}
              onIonChange={e => setStoreId(e.detail.value)}
            >
              {stores.map(s => <IonSelectOption key={s.id} value={s.id}>{getStoreName(s, state.regions)}</IonSelectOption>)}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.price}
            </IonLabel>
            <IonInput 
              value={price} 
              type="number" 
              clearInput
              onIonChange={e => setPrice(e.detail.value!)} 
            />
          </IonItem>
        </IonList>
      </IonContent>
      {storeId && price &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleSubmit} color="success">
            <IonIcon ios={checkmarkOutline} />
          </IonFabButton>
        </IonFab>
      }
    </IonPage>
  )
}
export default AddPackStore
