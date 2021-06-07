import {useContext, useEffect, useState} from 'react'
import {addRegion, getMessage} from '../data/actions'
import labels from '../data/labels'
import { IonButton, IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, useIonToast } from '@ionic/react'
import { useHistory, useLocation } from 'react-router'
import Header from './header'
import { StateContext } from '../data/state-provider'
import { checkmarkOutline } from 'ionicons/icons'

const AddLocation = () => {
  const {state, dispatch} = useContext(StateContext)
  const [name, setName] = useState('')
  const [ordering, setOrdering] = useState('')
  const [position, setPosition] = useState({lat: 0, lng: 0})
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  useEffect(() => {
    if (state.mapPosition) setPosition(state.mapPosition)
    return function cleanUp() {
      dispatch({type: 'CLEAR_MAP_POSITION'})
    }
  }, [state.mapPosition, dispatch])
  const handleSubmit = () => {
    try{
      const region = {
        id: Math.random().toString(),
        name,
        ordering: +ordering,
        position
      }
      addRegion(region)
      message(labels.addSuccess, 3000)
      history.goBack()
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return (
    <IonPage>
      <Header title={labels.addRegion} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.name}
            </IonLabel>
            <IonInput 
              value={name} 
              type="text" 
              autofocus
              clearInput
              onIonChange={e => setName(e.detail.value!)} 
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.ordering}
            </IonLabel>
            <IonInput 
              value={ordering} 
              type="number" 
              autofocus
              clearInput
              onIonChange={e => setOrdering(e.detail.value!)} 
            />
          </IonItem>
        </IonList>
        <div className="ion-text-center">
          <IonButton 
            fill="solid" 
            shape="round"
            style={{width: '10rem'}}
            routerLink="/map/31.961618297421616/35.90991689308968"
          >
            {labels.map}
          </IonButton>
        </div>
      </IonContent>
      {name && position.lat &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleSubmit} color="success">
            <IonIcon ios={checkmarkOutline} />
          </IonFabButton>
        </IonFab>
      }
    </IonPage>
  )
}
export default AddLocation
