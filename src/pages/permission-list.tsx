import {useContext, useState, useEffect} from 'react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import {User} from '../data/types'
import moment from 'moment'
import 'moment/locale/ar'
import { IonContent, IonItem, IonLabel, IonList, IonPage } from '@ionic/react'
import Header from './header'

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
                  <div className="list-row1">{u.name}</div>
                  <div className="list-row2">{u.storeName}</div>
                  <div className="list-row3">{moment(u.time).fromNow()}</div>
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
