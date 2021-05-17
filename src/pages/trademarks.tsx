import {useContext, useState, useEffect} from 'react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import { IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, useIonAlert, useIonToast } from '@ionic/react'
import Header from './header'
import { addOutline, trashOutline } from 'ionicons/icons'
import { useLocation } from 'react-router'
import { deleteTrademark, getMessage } from '../data/actions'

const Trademarks = () => {
  const {state} = useContext(StateContext)
  const location = useLocation()
  const [message] = useIonToast()
  const [alert] = useIonAlert()
  const [trademarks, setTrademarks] = useState(() => [...state.trademarks].sort((t1, t2) => t1.name > t2.name ? 1 : -1))
  useEffect(() => {
    setTrademarks(() => [...state.trademarks].sort((t1, t2) => t1.name > t2.name ? 1 : -1))
  }, [state.trademarks])
  const handleDelete = (trademarkId: string) => {
    alert({
      header: labels.confirmationTitle,
      message: labels.confirmationText,
      buttons: [
        {text: labels.cancel},
        {text: labels.ok, handler: async () => {
          try{
            const trademarkProducts = state.products.filter(p => p.trademarkId === trademarkId)
            if (trademarkProducts.length > 0) throw new Error('trademarkProductsFound') 
            deleteTrademark(trademarkId, state.trademarks)
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
      <Header title={labels.trademarks} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {trademarks.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : trademarks.map(t =>
              <IonItem key={t.id} routerLink={`/edit-trademark/${t.id}`}>
                <IonLabel>{t.name}</IonLabel>
                <IonIcon 
                  ios={trashOutline} 
                  slot="end" 
                  style={{fontSize: '20px', marginRight: '10px'}} 
                  onClick={()=> handleDelete(t.id)}
                />
              </IonItem>  
            )
          }
        </IonList>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton routerLink="/add-trademark">
          <IonIcon ios={addOutline} />
        </IonFabButton>
      </IonFab>
    </IonPage>
  )
}

export default Trademarks
