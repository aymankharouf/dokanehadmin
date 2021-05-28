import {useState, useContext, useEffect} from 'react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import {editStore, getMessage} from '../data/actions'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonButton, IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonSelect, IonSelectOption, useIonToast } from '@ionic/react'
import Header from './header'
import { checkmarkOutline } from 'ionicons/icons'
import { userTypes, patterns } from '../data/config'

type Params = {
  id: string
}
const EditStore = () => {
  const {state, dispatch} = useContext(StateContext)
  const params = useParams<Params>()
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [store] = useState(() => state.stores.find(s => s.id === params.id)!)
  const [name, setName] = useState(store.name)
  const [mobile, setMobile] = useState(store.mobile)
  const [mobileInvalid, setMobileInvalid] = useState(false)
  const [address, setAddress] = useState(store.address)
  const [type, setType] = useState(store.type)
  const [regionId, setRegionId] = useState(store.regionId)
  const [hasChanged, setHasChanged] = useState(false)
  const [position, setPosition] = useState(store.position)
  useEffect(() => {
    setMobileInvalid(!mobile || !patterns.mobile.test(mobile))
  }, [mobile])
  useEffect(() => {
    if (name !== store.name
    || mobile !== store.mobile
    || type !== store.type
    || address !== store.address
    || position.lat !== store.position.lat
    || position.lng !== store.position.lng
    || regionId !== store.regionId) setHasChanged(true)
    else setHasChanged(false)
  }, [store, name, mobile, address, type, regionId, position])
  useEffect(() => {
    if (state.mapPosition) setPosition(state.mapPosition)
    return function cleanUp() {
      dispatch({type: 'CLEAR_MAP_POSITION'})
    }
  }, [state.mapPosition, dispatch])

  const handleSubmit = () => {
    try{
      if (state.stores.find(s => s.id !== store.id && s.mobile === mobile)) {
        throw new Error('dubplicateStoreMobile')
      }
      if (state.stores.find(s => s.id !== store.id && s.regionId === regionId && s.name === name)) {
        throw new Error('duplicateStoreName')
      }
      const newStore = {
        ...store,
        name,
        mobile,
        address,
        type,
        regionId,
        position
      }
      editStore(newStore)
      message(labels.editSuccess, 3000)
      history.goBack()
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return (
    <IonPage>
      <Header title={labels.editStore} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel position="floating" color="primary">{labels.name}</IonLabel>
            <IonInput 
              value={name} 
              type="text" 
              autofocus
              clearInput
              onIonChange={e => setName(e.detail.value!)} 
            />
          </IonItem>
          <IonItem>
            <IonLabel 
              position="floating" 
              color={mobileInvalid ? 'danger' : 'primary'}
            >
              {labels.mobile}
            </IonLabel>
            <IonInput 
              value={mobile} 
              type="number" 
              clearInput
              onIonChange={e => setMobile(e.detail.value!)} 
              color={mobileInvalid ? 'danger' : ''}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">{labels.type}</IonLabel>
            <IonSelect 
              ok-text={labels.ok} 
              cancel-text={labels.cancel} 
              value={type}
              onIonChange={e => setType(e.detail.value)}
            >
              {userTypes.map(t => t.id === 'n' ? null : <IonSelectOption key={t.id} value={t.id}>{t.name}</IonSelectOption>)}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">{labels.region}</IonLabel>
            <IonSelect 
              ok-text={labels.ok} 
              cancel-text={labels.cancel} 
              value={regionId}
              onIonChange={e => setRegionId(e.detail.value)}
            >
              {state.regions.map(r => <IonSelectOption key={r.id} value={r.id}>{r.name}</IonSelectOption>)}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">{labels.address}</IonLabel>
            <IonInput 
              value={address} 
              type="text" 
              autofocus
              clearInput
              onIonChange={e => setAddress(e.detail.value!)} 
            />
          </IonItem>
        </IonList>
        <div className="ion-text-center">
          <IonButton 
            fill="solid" 
            shape="round"
            style={{width: '10rem'}}
            routerLink={`/map/${store.position.lat}/${store.position.lng}`}
          >
            {labels.map}
          </IonButton>
        </div>
      </IonContent>
      {name && !mobileInvalid && hasChanged &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleSubmit} color="success">
            <IonIcon ios={checkmarkOutline} />
          </IonFabButton>
        </IonFab>
      }
    </IonPage>
  )
}
export default EditStore
