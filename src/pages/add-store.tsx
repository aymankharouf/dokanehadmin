import {useState, useEffect, useContext} from 'react'
import {addStore, getMessage} from '../data/actions'
import labels from '../data/labels'
import {StateContext} from '../data/state-provider'
import { userTypes, patterns } from '../data/config'
import { IonButton, IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonSelect, IonSelectOption, IonToggle, useIonLoading, useIonToast } from '@ionic/react'
import { useHistory, useLocation } from 'react-router'
import Header from './header'
import { checkmarkOutline } from 'ionicons/icons'

const AddStore = () => {
  const {state} = useContext(StateContext)
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [loading, dismiss] = useIonLoading()
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [mobileInvalid, setMobileInvalid] = useState(true)
  const [address, setAddress] = useState('')
  const [isActive, setIsActive] = useState(false)
  const [locationId, setLocationId] = useState('')
  const [type, setType] = useState('')
  const [locations] = useState(() => [...state.locations].sort((l1, l2) => l1.name > l2.name ? 1 : -1))
  const [lat, setLat] = useState(0)
  const [lng, setLng] = useState(0)
  useEffect(() => {
    setMobileInvalid(!mobile || !patterns.mobile.test(mobile))
  }, [mobile])
  const handleSetPosition = () => {
    loading()
    navigator.geolocation.getCurrentPosition(
      (position) => {
        dismiss()
        setLat(position.coords.latitude)
        setLng(position.coords.longitude)
      },
      () => null
    );
  }
  const handleSubmit = () => {
    try{
      if (state.stores.find(s => s.mobile === mobile)) {
        throw new Error('dubplicateStoreMobile')
      }
      if (state.stores.find(s => s.locationId === locationId && s.name === name)) {
        throw new Error('duplicateStoreName')
      }
      const store = {
        name,
        mobile,
        isActive,
        locationId,
        address,
        position: {lat: +lat, lng: +lng},
        type,
        claimsCount: 0,
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
          {!lat &&
            <IonButton 
              expand="block" 
              fill="clear" 
              onClick={handleSetPosition}
            >
              {labels.setPosition}
            </IonButton>
          }
        </IonList>
      </IonContent>
      {name && locationId && type && !mobileInvalid && lat &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleSubmit}>
            <IonIcon ios={checkmarkOutline} />
          </IonFabButton>
        </IonFab>
      }
    </IonPage>
  )
}
export default AddStore
