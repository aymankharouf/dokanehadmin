import {useState, useContext} from 'react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import {addPackStore, getMessage} from '../data/actions'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonSelect, IonSelectOption, useIonToast } from '@ionic/react'
import Header from './header'
import { checkmarkOutline } from 'ionicons/icons'

type Params = {
  storeId: string,
  requestId: string
}
const AddStorePack = () => {
  const {state} = useContext(StateContext)
  const params = useParams<Params>()
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [packId, setPackId] = useState('')
  const [packRequest] = useState(() => state.packRequests.find(r => r.id === params.requestId))
  const [store] = useState(() => state.stores.find(s => s.id === params.storeId)!)
  const [price, setPrice] = useState(packRequest?.price.toFixed(2) || '')
  const [packs] = useState(() => {
    let packs
    if (params.requestId) {
      const siblingPack = state.packs.find(p => p.id === packRequest?.siblingPackId)
      packs = state.packs.filter(p => p.product.id === siblingPack?.product.id)
    } else {
      packs = state.packs.map(p => {
        return {
          ...p,
          name: `${p.product.name}-${p.product.alias} ${p.name}`
        }
      })
    }
    return packs.sort((p1, p2) => p1.name > p2.name ? 1 : -1)
  }) 
  const handleSubmit = () => {
    try{
      if (state.packStores.find(p => p.packId === packId && p.storeId === store.id)) {
        throw new Error('duplicatePackInStore')
      }
      if (+price <= 0 || +price !== Number((+price).toFixed(2))) {
        throw new Error('invalidPrice')
      }
      const packStore = {
        packId,
        storeId: store.id!,
        price: +price,
        isRetail: store.type === 's',
        time: new Date()
      }
      addPackStore(packStore, state.packs, state.users, state.packRequests, packRequest)
      message(labels.addSuccess, 3000)
      if (packRequest) history.push('/')
      else history.goBack()
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }

  return (
    <IonPage>
      <Header title={`${labels.addProduct} ${store.name}`} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel position="floating" color="primary">{labels.product}</IonLabel>
            <IonSelect 
              ok-text={labels.ok} 
              cancel-text={labels.cancel} 
              onIonChange={e => setPackId(e.detail.value)}
            >
              {packs.map(p => <IonSelectOption key={p.id} value={p.id}>{p.name}</IonSelectOption>)}
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
      {packId && price &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleSubmit}>
            <IonIcon ios={checkmarkOutline} />
          </IonFabButton>
        </IonFab>
      }
    </IonPage>
  )
}
export default AddStorePack
