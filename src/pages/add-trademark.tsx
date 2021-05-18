import {useContext, useState} from 'react'
import {StateContext } from '../data/state-provider'
import labels from '../data/labels'
import {addTrademark, getMessage} from '../data/actions'
import { IonButton, IonContent, IonInput, IonItem, IonLabel, IonList, IonPage, useIonToast } from '@ionic/react'
import { useHistory, useLocation } from 'react-router'
import Header from './header'


const AddTrademark = () => {
  const {state} = useContext(StateContext)
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [name, setName] = useState('')
  const handleSubmit = () => {
    try{
      if (state.trademarks.filter(t => t.name === name).length > 0) {
        throw new Error('duplicateName')
      }
      addTrademark({
        id: Math.random().toString(),
        name
      })
      message(labels.addSuccess, 3000)
      history.goBack()
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return (
    <IonPage>
      <Header title={labels.addTrademark} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel position="floating">
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
        </IonList>
        {name && 
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
export default AddTrademark
