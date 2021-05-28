import {useContext, useEffect, useState} from 'react'
import {randomColors} from '../data/config'
import labels from '../data/labels'
import { IonButton, IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react'
import { StateContext } from '../data/state-provider'

const Home = () => {
  const {state} = useContext(StateContext)
  const [mainPages] = useState(() => [
    {id: '1', name: labels.products, path: '/products/0'},
    {id: '2', name: labels.settings, path: '/settings'},
    {id: '3', name: labels.stores, path: '/stores'},
    {id: '4', name: labels.users, path: '/user-types'},
    {id: '5', name: labels.logs, path: '/logs'},
    {id: '6', name: labels.notifications, path: '/notifications'}
  ])
  const [approvalsCount, setApprovalsAcount] = useState(0)
  useEffect(() => {
    const newUsers = state.users.filter(u => u.type !== 'n' && !u.storeId).length
    setApprovalsAcount(state.passwordRequests.length + state.productRequests.length + state.packRequests.length + newUsers)
  }, [state.users, state.passwordRequests, state.productRequests, state.packRequests])

  let i = 0
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle><img src="/dokaneh_logo.png" alt="logo" style={{width: '120px', marginBottom: '-5px'}} /></IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large"><img src="/dokaneh_logo.png" alt="logo" style={{width: '120px', marginBottom: '-15px'}} /></IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonButton
          routerLink="/approvals" 
          expand="block"
          shape="round"
          color={randomColors[i++ % 7].name}
          className="sections" 
        >
          {`${labels.approvals} ${approvalsCount > 0 ? '(' + approvalsCount + ')' : ''}`}
        </IonButton>
        {mainPages.map(p => 
          <IonButton
            routerLink={p.path} 
            expand="block"
            shape="round"
            color={randomColors[i++ % 7].name}
            className="sections" 
            key={p.id}
          >
            {p.name}
          </IonButton>
        )}
      </IonContent>
    </IonPage>
  )
}

export default Home
