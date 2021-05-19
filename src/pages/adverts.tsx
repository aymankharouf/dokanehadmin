import {useContext, useState, useEffect} from 'react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import moment from 'moment'
import 'moment/locale/ar'
import {updateAdvertStatus, getMessage, deleteAdvert} from '../data/actions'
import {advertTypes, randomColors} from '../data/config'
import {Advert} from '../data/types'
import { IonActionSheet, IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, useIonAlert, useIonToast } from '@ionic/react'
import { useHistory, useLocation } from 'react-router'
import Header from './header'
import { addOutline, ellipsisVerticalOutline } from 'ionicons/icons'

const Adverts = () => {
  const {state} = useContext(StateContext)
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [alert] = useIonAlert()
  const [currentAdvert, setCurrentAdvert] = useState<Advert>()
  const [adverts, setAdverts] = useState<Advert[]>([])
  const [actionOpened, setActionOpened] = useState(false);
  useEffect(() => {
    setAdverts(() => [...state.adverts].sort((a1, a2) => a2.time > a1.time ? 1 : -1))
  }, [state.adverts])
  const handleAction = (advert: Advert) => {
    setCurrentAdvert(advert)
    setActionOpened(true)
  }
  const handleUpdate = () => {
    if (!currentAdvert) return
    alert({
      header: labels.confirmationTitle,
      message: labels.confirmationText,
      buttons: [
        {text: labels.cancel},
        {text: labels.ok, handler: () => {
          try{
            updateAdvertStatus(currentAdvert, state.adverts)
            message(labels.editSuccess, 3000)
          } catch(err) {
            message(getMessage(location.pathname, err), 3000)
          }    
        }},
      ],
    })
  }
  const handleDelete = () => {
    if (!currentAdvert) return
    alert({
      header: labels.confirmationTitle,
      message: labels.confirmationText,
      buttons: [
        {text: labels.cancel},
        {text: labels.ok, handler: () => {
          try{
            deleteAdvert(currentAdvert)
            message(labels.deleteSuccess, 3000)
          } catch(err) {
            message(getMessage(location.pathname, err), 3000)
          }    
        }},
      ],
    })
  }
  return (
    <IonPage>
      <Header title={labels.adverts} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {adverts.length === 0 ?
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : adverts.map(a => 
              <IonItem key={a.id} className={currentAdvert && currentAdvert.id === a.id ? 'selected' : ''}>
                <IonLabel>
                  <IonText color={randomColors[0].name}>{advertTypes.find(t => t.id === a.type)?.name}</IonText>
                  <IonText color={randomColors[1].name}>{a.title}</IonText>
                  <IonText color={randomColors[2].name}>{a.text}</IonText>
                  <IonText color={randomColors[3].name}>{a.isActive ? labels.isActive : labels.inActive}</IonText>
                  <IonText color={randomColors[4].name}>{moment(a.time).fromNow()}</IonText>
                </IonLabel>
                <IonIcon 
                  ios={ellipsisVerticalOutline} 
                  slot="end" 
                  color="danger"
                  style={{fontSize: '20px', marginRight: '10px'}} 
                  onClick={()=> handleAction(a)}
                />
              </IonItem>    
            )
          }
        </IonList>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton routerLink="/add-advert">
          <IonIcon ios={addOutline} />
        </IonFabButton>
      </IonFab>
      <IonActionSheet
          isOpen={actionOpened}
          onDidDismiss={() => setActionOpened(false)}
          buttons={[
            {
              text: labels.details,
              cssClass: 'primary',
              handler: () => history.push(`/advert-details/${currentAdvert?.id}`)
            },
            {
              text: currentAdvert?.isActive ? labels.stop : labels.activate,
              cssClass: 'secondary',
              handler: () => handleUpdate()
            },
            {
              text: labels.delete,
              cssClass: 'danger',
              handler: () => handleDelete()
            },
          ]}
        />
    </IonPage>
  )
}

export default Adverts
