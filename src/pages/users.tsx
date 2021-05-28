import {useContext, useState, useEffect} from 'react'
import moment from 'moment'
import 'moment/locale/ar'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import {User} from '../data/types'
import {randomColors, userTypes} from '../data/config'
import { useParams } from 'react-router'
import { IonBadge, IonContent, IonItem, IonLabel, IonList, IonPage, IonText } from '@ionic/react'
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
                  <IonText color={randomColors[0].name}>{`${labels.name}: ${u.name}`}</IonText>
                  <IonText color={randomColors[1].name}>{`${labels.mobile}: ${u.mobile}`}</IonText>
                  {u.storeName && <IonText color={randomColors[2].name}>{`${labels.storeName}: ${u.storeName}`}</IonText>}
                  {u.regionId && <IonText color={randomColors[3].name}>{`${labels.region}: ${state.regions.find(r => r.id === u.regionId)?.name}`}</IonText>}
                  {u.address && <IonText color={randomColors[4].name}>{`${labels.address}: ${u.address}`}</IonText>}
                  <IonText color={randomColors[5].name}>{moment(u.time).fromNow()}</IonText>
                </IonLabel>
                {!u.isActive && <IonBadge color="danger">{labels.inActive}</IonBadge>}
              </IonItem>  
            )
          }
        </IonList>
      </IonContent>
    </IonPage>
  )
}

export default Users
