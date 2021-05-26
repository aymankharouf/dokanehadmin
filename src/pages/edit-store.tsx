import {useState, useContext, useEffect} from 'react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import {editStore, getMessage} from '../data/actions'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonButton, IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonSelect, IonSelectOption, IonToggle, useIonToast } from '@ionic/react'
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
  const [isActive, setIsActive] = useState(store.isActive)
  const [locationId, setLocationId] = useState(store.locationId)
  const [hasChanged, setHasChanged] = useState(false)
  const [position, setPosition] = useState({lat: 0, lng: 0})
  const [locations] = useState(() => [...state.locations].sort((l1, l2) => l1.name > l2.name ? 1 : -1))
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
    || isActive !== store.isActive
    || locationId !== store.locationId) setHasChanged(true)
    else setHasChanged(false)
  }, [store, name, mobile, address, isActive, type, locationId, position])
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
      if (state.stores.find(s => s.id !== store.id && s.locationId === locationId && s.name === name)) {
        throw new Error('duplicateStoreName')
      }
      const newStore = {
        ...store,
        name,
        isActive,
        mobile,
        address,
        type,
        locationId,
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
            <IonLabel color="primary">{labels.isActive}</IonLabel>
            <IonToggle checked={isActive} onIonChange={() => setIsActive(s => !s)}/>
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
            <IonLabel position="floating" color="primary">{labels.location}</IonLabel>
            <IonSelect 
              ok-text={labels.ok} 
              cancel-text={labels.cancel} 
              value={locationId}
              onIonChange={e => setLocationId(e.detail.value)}
            >
              {locations.map(l => <IonSelectOption key={l.id} value={l.id}>{l.name}</IonSelectOption>)}
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
          <IonButton 
            expand="block" 
            fill="clear" 
            routerLink={`/map/${store.position.lat}/${store.position.lng}`}
          >
            {labels.map}
          </IonButton>
        </IonList>
      </IonContent>
      {name && !mobileInvalid && hasChanged &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleSubmit}>
            <IonIcon ios={checkmarkOutline} />
          </IonFabButton>
        </IonFab>
      }
    </IonPage>
  )
}
export default EditStore
