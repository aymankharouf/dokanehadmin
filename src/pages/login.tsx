import {useState} from 'react'
import {login, getMessage} from '../data/actions'
import labels from '../data/labels'
import { IonButton, IonButtons, IonContent, IonFooter, IonInput, IonItem, IonLabel, IonList, IonPage, IonToolbar, useIonLoading, useIonToast } from '@ionic/react'
import { useHistory, useLocation } from 'react-router'
import Header from './header'
import { Link } from 'react-router-dom'

const Login = () => {
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [loading, dismiss] = useIonLoading()
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const handleLogin = async () => {
    try{
      loading()
      await login(email, password)
      dismiss()
      message(labels.loginSuccess, 3000)
      history.goBack()
    } catch(err) {
      dismiss()
			message(getMessage(location.pathname, err), 3000)
		}
  }

  return (
    <IonPage>
      <Header title={labels.login} />
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
          <IonButton expand="block" fill="clear" onClick={handleLogin}>{labels.login}</IonButton>
        }
      </IonContent>
      <IonFooter>
        <IonToolbar>
          <IonButtons slot="start">
            <Link to="/register">{labels.registerTitle}</Link>
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
