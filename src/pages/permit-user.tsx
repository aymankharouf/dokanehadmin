import {useContext, useState} from 'react'
import {permitUser, getMessage} from '../data/actions'
import labels from '../data/labels'
import {StateContext} from '../data/state-provider'
import { storeTypes } from '../data/config'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonSelect, IonSelectOption, useIonLoading, useIonToast } from '@ionic/react'
import Header from './header'
import { checkmarkOutline } from 'ionicons/icons'

type Params = {
  id: string
}
const PermitUser = () => {
  const {state} = useContext(StateContext)
  const params = useParams<Params>()
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [loading, dismiss] = useIonLoading()
  const [user] = useState(() => state.users.find(u => u.id === params.id)!)
  const [storeName, setStoreName] = useState(user.storeName || '')
  const [address, setAddress] = useState(user.address || '')
  const [locationId, setLocationId] = useState('')
  const [type, setType] = useState('')
  const [locations] = useState(() => [...state.locations].sort((l1, l2) => l1.name > l2.name ? 1 : -1))
  const handlePermit = () => {
    try{
      loading()
      permitUser(user, type, storeName, locationId, address)
      dismiss()
      message(labels.permitSuccess, 3000)
      history.goBack()
    } catch (err){
      dismiss()
      message(getMessage(location.pathname, err), 3000)
    }
  }
  return (
    <IonPage>
      <Header title={labels.permitUser} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel position="floating" color="primary">{labels.user}</IonLabel>
            <IonInput 
              value={user.name} 
              type="text" 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel 
              position="floating" 
              color="primary"
            >
              {labels.mobile}
            </IonLabel>
            <IonInput 
              value={user.mobile} 
              type="text" 
              readonly
            />
          </IonItem>
          {user.type !== 'n' && <>
            <IonItem>
              <IonLabel position="floating" color="primary">{labels.storeName}</IonLabel>
              <IonInput 
                value={storeName} 
                type="text" 
                autofocus
                clearInput
                onIonChange={e => setStoreName(e.detail.value!)} 
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
                {storeTypes.map(t => <IonSelectOption key={t.id} value={t.id}>{t.name}</IonSelectOption>)}
              </IonSelect>
            </IonItem>
          </>}
          {type !== 'd' && <>
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
                clearInput
                onIonChange={e => setAddress(e.detail.value!)} 
              />
            </IonItem>
          </>}
        </IonList>
      </IonContent>
      {(address || type === 'd' || user.type === 'n') && (type || user.type === 'n') && (locationId || type === 'd') && (storeName || user.type === 'n') &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={handlePermit}>
            <IonIcon ios={checkmarkOutline} />
          </IonFabButton>
        </IonFab>
      }
    </IonPage>
  )
}
export default PermitUser
