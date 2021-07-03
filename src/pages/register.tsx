import { useState } from 'react'
import { registerUser, getMessage } from '../data/actions'
import labels from '../data/labels'
import { useHistory, useLocation } from 'react-router'
import { IonButton, IonContent, IonInput, IonItem, IonLabel, IonList, IonPage, useIonToast } from '@ionic/react'
import Header from './header'

const Register = () => {
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const handleRegister = async () => {
    try{
      await registerUser(email, password)
      message(labels.registerSuccess, 3000)
      history.goBack()
    } catch (err){
      message(getMessage(location.pathname, err), 3000)
    }
  }

  return (
    <IonPage>
      <Header title={labels.newUser} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel position="floating">
              {labels.email}
            </IonLabel>
            <IonInput 
              value={email} 
              type="text" 
              autofocus
              clearInput
              onIonChange={e => setEmail(e.detail.value!)} 
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">
              {labels.password}
            </IonLabel>
            <IonInput 
              value={password} 
              type="text" 
              clearInput
              onIonChange={e => setPassword(e.detail.value!)} 
            />
          </IonItem>
        </IonList>
        {email && password &&
          <div className="ion-padding" style={{textAlign: 'center'}}>
            <IonButton 
              fill="solid" 
              shape="round"
              style={{width: '10rem'}}
              onClick={handleRegister}
            >
              {labels.register}
            </IonButton>
          </div>
        }
      </IonContent>
    </IonPage>
  )
}
export default Register
