import {useContext, useState, useEffect} from 'react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import { colors, userTypes } from '../data/config'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonActionSheet, IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonToggle, useIonAlert, useIonToast } from '@ionic/react'
import Header from './header'
import { settingsOutline } from 'ionicons/icons'
import { changeStoreStatus, getMessage, linkOwner } from '../data/actions'

type Params = {
  id: string
}
const StoreDetails = () => {
  const {state} = useContext(StateContext)
  const params = useParams<Params>()
  const [message] = useIonToast()
  const [alert] = useIonAlert()
  const history = useHistory()
  const location = useLocation()
  const [store, setStore] = useState(() => state.stores.find(s => s.id === params.id)!)
  const [actionOpened, setActionOpened] = useState(false)
  useEffect(() => {
    setStore(() => state.stores.find(s => s.id === params.id)!)
  }, [state.stores, params.id])
  const handleLinkOwner = () => {
    try {
      const owner = state.users.find(u => u.mobile === store.mobile)
      if (owner) {
        linkOwner(owner, store)
        message(labels.editSuccess, 3000)
      } else {
        throw new Error('noMatchingMobile')
      }
    } catch (err) {
      message(getMessage(location.pathname, err), 3000)
    }
  }
  const handleChangeStatus = () => {
    alert({
      header: labels.confirmationTitle,
      message: labels.confirmationText,
      buttons: [
        {text: labels.cancel},
        {text: labels.ok, handler: () => {
          try{
            changeStoreStatus(store, state)
            message(labels.editSuccess, 3000)
          } catch(err) {
            message(getMessage(location.pathname, err), 3000)
          }    
        }},
      ],
    })
  }
  let i = 0
  return (
    <IonPage>
      <Header title={labels.storeDetails} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.name}
            </IonLabel>
            <IonInput 
              value={store.name} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.mobile}
            </IonLabel>
            <IonInput 
              value={store.mobile} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.owner}
            </IonLabel>
            <IonInput 
              value={state.users.find(u => u.id === store.ownerId)?.name} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel color="primary">{labels.isActive}</IonLabel>
            <IonToggle checked={store.isActive} disabled/>
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.type}
            </IonLabel>
            <IonInput 
              value={userTypes.find(t => t.id === store.type)!.name} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.region}
            </IonLabel>
            <IonInput 
              value={state.regions.find(r => r.id === store.regionId)?.name || ''} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.address}
            </IonLabel>
            <IonInput 
              value={store.address} 
              readonly
            />
          </IonItem>
        </IonList>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton onClick={() => setActionOpened(true)}>
          <IonIcon ios={settingsOutline} />
        </IonFabButton>
      </IonFab>
      <IonActionSheet
        isOpen={actionOpened}
        onDidDismiss={() => setActionOpened(false)}
        buttons={[
          {
            text: labels.edit,
            cssClass: colors[i++ % 10].name,
            handler: () => history.push(`/edit-store/${params.id}`)
          },
          {
            text: labels.stop,
            cssClass: store.isActive ? colors[i++ % 10].name : 'ion-hide',
            handler: () => handleChangeStatus()
          },
          {
            text: labels.activate,
            cssClass: !store.isActive ? colors[i++ % 10].name : 'ion-hide',
            handler: () => handleChangeStatus()
          },
          {
            text: labels.attachOwner,
            cssClass: !store.ownerId ? colors[i++ % 10].name : 'ion-hide',
            handler: () => handleLinkOwner()
          },
          {
            text: labels.storePacks,
            cssClass: colors[i++ % 10].name,
            handler: () => history.push(`/packs/${params.id}`)
          },

        ]}
      />
    </IonPage>
  )
}
export default StoreDetails
