import { useState } from 'react'
import { login, getMessage } from '../data/actions'
import labels from '../data/labels'
import { IonButton, IonButtons, IonContent, IonFooter, IonInput, IonItem, IonLabel, IonList, IonPage, IonToolbar, useIonToast } from '@ionic/react'
import { useHistory, useLocation } from 'react-router'
import Header from './header'
import { Link } from 'react-router-dom'

const Login = () => {
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const handleLogin = async () => {
    try{
      await login(email, password)
      message(labels.loginSuccess, 3000)
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
            <IonLabel position="floating" color="primary">
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
              onClick={handleLogin}
            >
              {labels.login}
            </IonButton>
          </div>
        }
      </IonContent>
      <IonFooter>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton fill="clear" onClick={() => history.replace('/register')}>
              {labels.newUser}
            </IonButton>
          </IonButtons>
          <IonButtons slot="end">
            <Link to="/change-password">{labels.changePassword}</Link>
          </IonButtons>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  )
}
export default Login
