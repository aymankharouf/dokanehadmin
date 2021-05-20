import {useContext, useState} from 'react'
import {sendNotification, getMessage} from '../data/actions'
import labels from '../data/labels'
import {StateContext} from '../data/state-provider'
import { IonButton, IonContent, IonInput, IonItem, IonLabel, IonList, IonPage, IonSelect, IonSelectOption, useIonToast } from '@ionic/react'
import { useHistory, useLocation } from 'react-router'
import Header from './header'


const AddNotification = () => {
  const {state} = useContext(StateContext)
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [userId, setUserId] = useState('')
  const [title, setTitle] = useState('')
  const [messageText, setMessageText] = useState('')
  const [users] = useState(() => [...state.users].sort((u1, u2) => u1.mobile > u2.mobile ? 1 : -1))
  const handleSubmit = () => {
    try{
      sendNotification(userId, title, messageText)
      message(labels.addSuccess, 3000)
      history.goBack()
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return (
    <IonPage>
    <Header title={labels.addNotification} />
    <IonContent fullscreen className="ion-padding">
      <IonList>
        <IonItem>
          <IonLabel position="floating" color="primary">{labels.toUser}</IonLabel>
          <IonSelect 
            ok-text={labels.ok} 
            cancel-text={labels.cancel} 
            value={userId}
            onIonChange={e => setUserId(e.detail.value)}
          >
            {users.map(u => <IonSelectOption key={u.id} value={u.id}>{u.name}</IonSelectOption>)}
          </IonSelect>
        </IonItem>
        <IonItem>
          <IonLabel position="floating">
            {labels.title}
          </IonLabel>
          <IonInput 
            value={title} 
            type="text" 
            clearInput
            onIonChange={e => setTitle(e.detail.value!)} 
          />
        </IonItem>
        <IonItem>
          <IonLabel position="floating">
            {labels.message}
          </IonLabel>
          <IonInput 
            value={messageText} 
            type="text" 
            clearInput
            onIonChange={e => setMessageText(e.detail.value!)} 
          />
        </IonItem>
      </IonList>
      {userId && title && messageText &&
        <IonButton 
          expand="block" 
          fill="clear" 
          onClick={handleSubmit}
        >
          {labels.save}
        </IonButton>
      }
    </IonContent>
  </IonPage>
  )
}
export default AddNotification
