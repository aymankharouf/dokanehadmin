import {useContext, useState, useEffect} from 'react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import {colors} from '../data/config'
import {User} from '../data/types'
import { IonButton, IonContent, IonPage } from '@ionic/react'
import Header from './header'

type Section = {
  id: string,
  name: string,
  path: string,
  count: number
}
const Approvals = () => {
  const {state} = useContext(StateContext)
  const [sections, setSections] = useState<Section[]>([])
  const [newUsers, setNewUsers] = useState<User[]>([])
  useEffect(() => {
    setNewUsers(() => state.users.filter(u => u.type !== 'n' && !u.storeId))
  }, [state.users])
  useEffect(() => {
    setSections(() => [
      {id: '1', name: labels.passwordRequests, path: '/password-requests', count: state.passwordRequests.length},
      {id: '2', name: labels.newUsers, path: '/permission-list', count: newUsers.length},
      {id: '3', name: labels.productRequests, path: '/product-requests', count: state.productRequests.length},
      {id: '4', name: labels.packRequests, path: '/pack-requests', count: state.packRequests.length},
    ])
  }, [state.passwordRequests, state.productRequests, state.packRequests, newUsers])
  let i = 0
  return(
    <IonPage>
      <Header title={labels.approvals} />
      <IonContent fullscreen>
        {sections.map(s => 
          <IonButton
            routerLink={s.path} 
            expand="block"
            shape="round"
            className={colors[i++ % 10].name}
            style={{margin: '0.9rem'}} 
            key={s.id}
          >
            {`${s.name} ${s.count > 0 ? '(' + s.count + ')' : ''}`}
          </IonButton>
        )}
      </IonContent>
    </IonPage>
  )
}

export default Approvals
