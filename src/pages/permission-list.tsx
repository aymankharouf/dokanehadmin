import {useContext, useState, useEffect} from 'react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import {User} from '../data/types'
import moment from 'moment'
import 'moment/locale/ar'
import { IonContent, IonItem, IonLabel, IonList, IonPage, IonText } from '@ionic/react'
import Header from './header'
import { randomColors } from '../data/config'

const PermissionList = () => {
  const {state} = useContext(StateContext)
  const [users, setUsers] = useState<User[]>([])
  useEffect(() => {
    setUsers(() => {
      const users = state.users.filter(u => (u.type !== 'n' && !u.storeId) || (u.type === 'n' && !u.position.lat && !u.locationId))
      return users.sort((u1, u2) => u1.time > u2.time ? 1 : -1)
    })
  }, [state.stores, state.users])
  return(
    <IonPage>
      <Header title={labels.newUsers} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {users.length === 0 ?
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : users.map(u => 
              <IonItem key={u.id} routerLink={`/permit-user/${u.id}`}>
                <IonLabel>
                  <IonText color={randomColors[0].name}>{u.name}</IonText>
                  <IonText color={randomColors[1].name}>{u.storeName}</IonText>
                  <IonText color={randomColors[2].name}>{moment(u.time).fromNow()}</IonText>
                </IonLabel>
              </IonItem>    
            )
          }
        </IonList>
      </IonContent>
    </IonPage>
  )
}

export default PermissionList
