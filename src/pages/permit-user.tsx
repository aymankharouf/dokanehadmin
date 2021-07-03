import { useContext, useEffect, useState } from 'react'
import { permitUser, getMessage } from '../data/actions'
import labels from '../data/labels'
import { StateContext } from '../data/state-provider'
import { userTypes } from '../data/config'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonButton, IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonSelect, IonSelectOption, useIonToast } from '@ionic/react'
import Header from './header'
import { checkmarkOutline } from 'ionicons/icons'

type Params = {
  id: string
}
const PermitUser = () => {
  const { state, dispatch } = useContext(StateContext)
  const params = useParams<Params>()
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [user] = useState(() => state.users.find(u => u.id === params.id)!)
  const [storeName, setStoreName] = useState(user.storeName)
  const [address, setAddress] = useState(user.address || '')
  const [regionId, setRegionId] = useState(user.regionId)
  const [type, setType] = useState(user.type)
  const [position, setPosition] = useState(user.position)
  useEffect(() => {
    if (state.mapPosition) setPosition(state.mapPosition)
    return function cleanUp() {
      dispatch({type: 'CLEAR_MAP_POSITION'})
    }
  }, [state.mapPosition, dispatch])
  const handlePermit = () => {
    try{
      if (state.stores.find(s => s.mobile === user.mobile)) {
        throw new Error('duplicateStoreMobile')
      }
      if (state.stores.find(s => s.regionId === user.regionId && s.name === storeName)) {
        throw new Error('duplicateStoreName')
      }
      permitUser(user, type, storeName!, regionId!, address, position)
      message(labels.permitSuccess, 3000)
      history.goBack()
    } catch (err){
      message(getMessage(location.pathname, err), 3000)
    }
  }
  return (
    <IonPage>
      <Header title={labels.permitUser} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.user}
            </IonLabel>
            <IonInput 
              value={user.name} 
              type="text" 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.mobile}
            </IonLabel>
            <IonInput 
              value={user.mobile} 
              type="text" 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.type}
            </IonLabel>
            <IonSelect 
              ok-text={labels.ok} 
              cancel-text={labels.cancel} 
              value={type}
              onIonChange={e => setType(e.detail.value)}
            >
              {userTypes.map(t => t.id === 'n' ? null : <IonSelectOption key={t.id} value={t.id}>{t.name}</IonSelectOption>)}
            </IonSelect>
          </IonItem>
          {type !== 'd' && <>
            <IonItem>
              <IonLabel position="floating" color="primary">
                {labels.storeName}
              </IonLabel>
              <IonInput 
                value={storeName} 
                type="text" 
                autofocus
                clearInput
                onIonChange={e => setStoreName(e.detail.value!)} 
              />
            </IonItem>
            <IonItem>
              <IonLabel position="floating" color="primary">
                {labels.region}
              </IonLabel>
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
              <IonLabel position="floating" color="primary">
                {labels.address}
              </IonLabel>
              <IonInput 
                value={address} 
                type="text" 
                clearInput
                onIonChange={e => setAddress(e.detail.value!)} 
              />
            </IonItem>
          </>}
        </IonList>
        {type !== 'd' && 
          <div className="ion-text-center">
            <IonButton 
              fill="solid" 
              shape="round"
              style={{width: '10rem'}}
              routerLink={`/map/${user.position.lat}/${user.position.lng}`}
            >
              {labels.map}
            </IonButton>
          </div>
        }
      </IonContent>
      {((address && regionId && storeName) || type === 'd') && 
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={handlePermit} color="success">
            <IonIcon ios={checkmarkOutline} />
          </IonFabButton>
        </IonFab>
      }
    </IonPage>
  )
}
export default PermitUser
