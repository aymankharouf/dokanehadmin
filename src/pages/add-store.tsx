import {useState, useEffect, useContext} from 'react'
import {addStore, getMessage} from '../data/actions'
import labels from '../data/labels'
import {StateContext} from '../data/state-provider'
import { userTypes, patterns } from '../data/config'
import { IonButton, IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonSelect, IonSelectOption, IonToggle, useIonToast } from '@ionic/react'
import { useHistory, useLocation } from 'react-router'
import Header from './header'
import { checkmarkOutline } from 'ionicons/icons'
import { Region } from '../data/types'

const AddStore = () => {
  const {state, dispatch} = useContext(StateContext)
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [mobileInvalid, setMobileInvalid] = useState(true)
  const [address, setAddress] = useState('')
  const [isActive, setIsActive] = useState(false)
  const [regionId, setRegionId] = useState('')
  const [type, setType] = useState('')
  const [position, setPosition] = useState({lat: 0, lng: 0})
  const [regionInfo, setRegionInfo] = useState<Region>()
  useEffect(() => {
    if (state.mapPosition) setPosition(state.mapPosition)
    return function cleanUp() {
      dispatch({type: 'CLEAR_MAP_POSITION'})
    }
  }, [state.mapPosition, dispatch])
  useEffect(() => {
    setMobileInvalid(!mobile || !patterns.mobile.test(mobile))
  }, [mobile])
  useEffect(() => {
    if (regionId) setRegionInfo(() => state.regions.find(r => r.id === regionId))
  }, [regionId, state.regions])
  const handleSubmit = () => {
    try{
      if (state.stores.find(s => s.mobile === mobile)) {
        throw new Error('duplicateStoreMobile')
      }
      if (state.stores.find(s => s.regionId === regionId && s.name === name)) {
        throw new Error('duplicateStoreName')
      }
      const store = {
        name,
        mobile,
        isActive,
        regionId,
        address,
        position,
        type,
        claimsCount: 0,
        ownerId: null,
        time: new Date()
      }
      addStore(store)
      message(labels.addSuccess, 3000)
      history.goBack()
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return (
    <IonPage>
      <Header title={labels.newStore} />
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
              color={mobileInvalid ? 'danger' : 'primary'}
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
        {regionId &&
          <div className="ion-text-center">
            <IonButton 
              fill="solid" 
              shape="round"
              style={{width: '10rem'}}
              routerLink={`/map/${regionInfo?.position.lat}/${regionInfo?.position.lng}`}
            >
              {labels.map}
            </IonButton>
          </div>
        }
      </IonContent>
      {name && regionId && type && !mobileInvalid && position.lat &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleSubmit} color="success">
            <IonIcon ios={checkmarkOutline} />
          </IonFabButton>
        </IonFab>
      }
    </IonPage>
  )
}
export default AddStore
