import { useState, useContext, useEffect, useRef } from 'react'
import { deleteRegion, editRegion, getMessage } from '../data/actions'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonButton, IonContent, IonFab, IonFabButton, IonFabList, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, useIonToast } from '@ionic/react'
import Header from './header'
import { checkmarkOutline, chevronDownOutline, trashOutline } from 'ionicons/icons'

type Params = {
  id: string
}
const EditLocation = () => {
  const { state, dispatch } = useContext(StateContext)
  const params = useParams<Params>()
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [region] = useState(() => state.regions.find(r => r.id === params.id)!)
  const [name, setName] = useState(region.name)
  const [ordering, setOrdering] = useState(region.ordering.toString())
  const [position, setPosition] = useState(region.position)
  const [hasChanged, setHasChanged] = useState(false)
  const fabList = useRef<HTMLIonFabElement | null>(null)
  useEffect(() => {
    if (hasChanged && fabList.current) fabList.current!.close()
  }, [hasChanged])
  useEffect(() => {
    if (name !== region.name
    || +ordering !== region.ordering
    || position.lat !== region.position.lat
    || position.lng !== region.position.lng) setHasChanged(true)
    else setHasChanged(false)
  }, [region, name, ordering, position])
  useEffect(() => {
    if (state.mapPosition) setPosition(state.mapPosition)
    return function cleanUp() {
      dispatch({type: 'CLEAR_MAP_POSITION'})
    }
  }, [state.mapPosition, dispatch])
  const handleEdit = () => {
    try{
      const newRegion = {
        ...region,
        name,
        ordering: +ordering,
        position
      }
      editRegion(newRegion, state.regions)
      message(labels.editSuccess, 3000)
      history.goBack() 
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }
  const handleDelete = () => {
    alert({
      header: labels.confirmationTitle,
      message: labels.confirmationText,
      buttons: [
        {text: labels.cancel},
        {text: labels.ok, handler: async () => {
          try{
            const regionStores = state.stores.filter(s => s.regionId === params.id)
            const regionUsers = state.users.filter(u => u.regionId === params.id)
            if (regionStores.length + regionUsers.length > 0) throw new Error('regionInUse') 
            deleteRegion(params.id, state.regions)
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
      <Header title={labels.editRegion} />
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
              type="text" 
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
            routerLink={`/map/${position.lat}/${position.lng}`}
          >
            {labels.map}
          </IonButton>
        </div>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed" ref={fabList} >
        <IonFabButton>
          <IonIcon ios={chevronDownOutline} />
        </IonFabButton>
        <IonFabList>
          <IonFabButton color="danger" onClick={handleDelete}>
            <IonIcon ios={trashOutline} />
          </IonFabButton>
          {name && hasChanged && 
            <IonFabButton color="success" onClick={handleEdit}>
              <IonIcon ios={checkmarkOutline} />
            </IonFabButton>
          }
        </IonFabList>
      </IonFab>
    </IonPage>
  )
}
export default EditLocation
