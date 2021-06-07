import {useState} from 'react'
import {changePassword, getMessage} from '../data/actions'
import labels from '../data/labels'
import { IonButton, IonContent, IonInput, IonItem, IonLabel, IonList, IonPage, useIonToast } from '@ionic/react'
import { useHistory, useLocation } from 'react-router'
import Header from './header'

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const handleSubmit = async () => {
    try{
      await changePassword(oldPassword, newPassword)
      message(labels.changePasswordSuccess, 3000)
      history.goBack()
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return (
    <IonPage>
      <Header title={labels.login} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.oldPassword}
            </IonLabel>
            <IonInput 
              value={oldPassword} 
              type="text" 
              autofocus
              clearInput
              onIonChange={e => setOldPassword(e.detail.value!)} 
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.newPassword}
            </IonLabel>
            <IonInput 
              value={newPassword} 
              type="text" 
              clearInput
              onIonChange={e => setNewPassword(e.detail.value!)} 
            />
          </IonItem>
        </IonList>
        {oldPassword && newPassword && oldPassword !== newPassword &&
          <div className="ion-padding" style={{textAlign: 'center'}}>
            <IonButton 
              fill="solid" 
              shape="round"
              style={{width: '10rem'}}
              onClick={handleSubmit}
            >
              {labels.submit}
            </IonButton>
          </div>
        }
      </IonContent>
    </IonPage>
  )
}
export default ChangePassword
