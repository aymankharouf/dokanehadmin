import {useContext, useState, useEffect} from 'react'
import moment from 'moment'
import 'moment/locale/ar'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import {User} from '../data/types'
import {userTypes} from '../data/config'
import { useParams } from 'react-router'
import { IonContent, IonItem, IonLabel, IonList, IonPage } from '@ionic/react'
import Header from './header'

type Params = {
  id: string
}
const Users = () => {
  const {state} = useContext(StateContext)
  const params = useParams<Params>()
  const [users, setUsers] = useState<User[]>([])
  useEffect(() => {
    setUsers(() => {
      const users = state.users.filter(u => u.type === params.id)
      return users.sort((u1, u2) => u1.time > u2.time ? -1 : 1)
    })
  }, [state.users, params.id])
  return(
    <IonPage>
      <Header title={userTypes.find(t => t.id === params.id)?.name} />
      <IonContent fullscreen className="ion-padding">
      <IonList>
          {users.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : users.map(u =>
              <IonItem key={u.id}>
                <IonLabel>
                  <div className="list-row1">{u.name}</div>
                  <div className="list-row2">{u.mobile}</div>
                  <div className="list-row3">{u.storeName}</div>
                  <div className="list-row4">{moment(u.time).fromNow()}</div>
                </IonLabel>
              </IonItem>  
            )
          }
        </IonList>
      </IonContent>
    </IonPage>
  )
}

export default Users
