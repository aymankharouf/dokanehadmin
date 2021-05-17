import {useState} from 'react'
import {randomColors} from '../data/config'
import labels from '../data/labels'
import { IonButton, IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react'

const Home = () => {
  const [mainPages] = useState(() => [
    {id: '1', name: labels.stores, path: '/stores'},
    {id: '2', name: labels.products, path: '/products/0'},
    {id: '3', name: labels.users, path: '/user-types'},
    {id: '4', name: labels.notifications, path: '/notifications'}
  ])
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
        {mainPages.map(p => 
          <IonButton
            routerLink={p.path} 
            expand="block"
            shape="round"
            color={randomColors[i++ % 5].name}
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
