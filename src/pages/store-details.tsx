import {useContext, useState, useEffect} from 'react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import { userTypes } from '../data/config'
import { useLocation, useParams } from 'react-router'
import { IonContent, IonFab, IonFabButton, IonFabList, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonToggle, useIonAlert, useIonToast } from '@ionic/react'
import Header from './header'
import { attachOutline, cartOutline, chevronDownOutline, flashOffOutline, flashOutline, pencilOutline } from 'ionicons/icons'
import { changeStoreStatus, getMessage, linkOwner } from '../data/actions'

type Params = {
  id: string
}
const StoreDetails = () => {
  const {state} = useContext(StateContext)
  const params = useParams<Params>()
  const [message] = useIonToast()
  const [alert] = useIonAlert()
  const location = useLocation()
  const [store, setStore] = useState(() => state.stores.find(s => s.id === params.id)!)
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
            changeStoreStatus(store, state.packStores, state.users)
            message(labels.editSuccess, 3000)
          } catch(err) {
            message(getMessage(location.pathname, err), 3000)
          }    
        }},
      ],
    })
  }
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
      <IonFab horizontal="end" vertical="top" slot="fixed">
        <IonFabButton>
          <IonIcon ios={chevronDownOutline}></IonIcon>
        </IonFabButton>
        <IonFabList>
          <IonFabButton color="success" routerLink={`/store-packs/${params.id}`}>
            <IonIcon ios={cartOutline}></IonIcon>
          </IonFabButton>
          <IonFabButton color="warning" routerLink={`/edit-store/${params.id}`}>
            <IonIcon ios={pencilOutline}></IonIcon>
          </IonFabButton>
          <IonFabButton color="danger" onClick={handleChangeStatus}>
            <IonIcon ios={store.isActive ? flashOffOutline: flashOutline}></IonIcon>
          </IonFabButton>
          {!store.ownerId && 
            <IonFabButton color="secondary" onClick={handleLinkOwner}>
              <IonIcon ios={attachOutline}></IonIcon>
            </IonFabButton>
          }
        </IonFabList>
      </IonFab>
    </IonPage>
  )
}
export default StoreDetails
