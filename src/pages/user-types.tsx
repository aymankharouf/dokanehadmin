import { IonButton, IonContent, IonPage } from '@ionic/react'
import { useContext } from 'react'
import {randomColors, userTypes} from '../data/config'
import labels from '../data/labels'
import { StateContext } from '../data/state-provider'
import Header from './header'

const UserTypes = () => {
  const {state} = useContext(StateContext)
  let i = 0
  return (
    <IonPage>
      <Header title={labels.users} />
      <IonContent fullscreen className="ion-padding">
        {userTypes.map(t => 
          <IonButton
            routerLink={`/users/${t.id}`} 
            expand="block"
            shape="round"
            color={randomColors[i++ % 5].name}
            className="sections" 
            key={t.id}
          >
            {`${t.name}(${state.users.filter(u => u.type === t.id).length})`}
          </IonButton>
        )}
      </IonContent>
    </IonPage>
  )
}

export default UserTypes
